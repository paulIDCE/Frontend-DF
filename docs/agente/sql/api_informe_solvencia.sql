/* =====================================================================================
   Propuesta para idce_bco_coop (esquema api): la BD responde las consultas del informe de
   solvencia del agente. Mismo resultado que los nodos "Ficha 13 meses" y "Pares por tamaño"
   del workflow n8n "Informe Solvencia (determinista)" (validados el 2026-10-05).
   Cuando existan, los nodos SQL del workflow pasan a:
     EXEC api.InformeSolvenciaFicha @IFIID = 48, @Mes = '2026-08';
     EXEC api.InformeSolvenciaPares @IFIID = 48, @Mes = '2026-08';
   Requiere GRANT EXECUTE al usuario de n8n (solo lectura).
   ===================================================================================== */

/* Corte efectivo: último FechaID de la entidad con indicadores <= fin del mes pedido.
   @Mes NULL o '2099-12' = último disponible. */
CREATE OR ALTER FUNCTION api.fnCorteEntidad (@IFIID int, @Mes char(7))
RETURNS int
AS
BEGIN
    RETURN (SELECT MAX(FechaID) FROM dbo.IndicadorData
            WHERE IFIID = @IFIID
              AND FechaID <= DATEDIFF(day, '19500101', EOMONTH(CAST(ISNULL(@Mes, '2099-12') + '-01' AS date))));
END
GO

/* Ficha de 13 meses: solvencia y sus componentes + balance mínimo, ya calculados. */
CREATE OR ALTER PROCEDURE api.InformeSolvenciaFicha
    @IFIID int,
    @Mes   char(7) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @IFIID IS NULL THROW 50020, N'@IFIID es obligatorio.', 1;
    DECLARE @corte int = api.fnCorteEntidad(@IFIID, @Mes);

    WITH f AS (
        SELECT FechaID FROM dbo.IndicadorData
        WHERE IFIID = @IFIID AND IndicadorFinID = 5 AND FechaID BETWEEN @corte - 370 AND @corte
    ),
    ind AS (
        SELECT d.FechaID,
               MAX(CASE WHEN d.IndicadorFinID = 1 THEN d.Valor END) apr,
               MAX(CASE WHEN d.IndicadorFinID = 2 THEN d.Valor END) ptp,
               MAX(CASE WHEN d.IndicadorFinID = 4 THEN d.Valor END) ptc,
               MAX(CASE WHEN d.IndicadorFinID = 5 THEN d.Valor END) solv
        FROM dbo.IndicadorData d
        WHERE d.IFIID = @IFIID AND d.FechaID IN (SELECT FechaID FROM f)
        GROUP BY d.FechaID
    ),
    bal AS (
        SELECT b.FechaID,
               SUM(CASE WHEN b.CuentaID = 1 THEN b.Saldo END) act,
               SUM(CASE WHEN b.CuentaID = 3 THEN b.Saldo END) pat,
               SUM(CASE WHEN b.CuentaID = 5 THEN b.Saldo WHEN b.CuentaID = 4 THEN -b.Saldo END) res,
               SUM(CASE WHEN b.CuentaID BETWEEN 1401 AND 1496 THEN b.Saldo END) cbruta,
               SUM(CASE WHEN b.CuentaID = 1499 THEN -b.Saldo END) prov,
               SUM(CASE WHEN b.CuentaID BETWEEN 1425 AND 1472
                          OR b.CuentaID IN (1479, 1481, 1483, 1485, 1487, 1489) THEN b.Saldo END) improd
        FROM dbo.B11 b
        WHERE b.IFIID = @IFIID AND b.FechaID IN (SELECT FechaID FROM f)
          AND (b.CuentaID IN (1, 3, 4, 5, 1499) OR b.CuentaID BETWEEN 1401 AND 1496)
        GROUP BY b.FechaID
    )
    SELECT e.Nombre AS nombre, e.TipoEntidad AS tipo,
           CONVERT(char(7), DATEADD(day, i.FechaID, '19500101'), 126)        AS mes,
           CAST(i.solv * 100 AS decimal(6, 2))                                 AS solv_pct,
           CAST(i.ptc / 1e6 AS decimal(12, 2))                                 AS ptc_mm,
           CAST(i.ptp / NULLIF(i.ptc, 0) * 100 AS decimal(6, 1))               AS ptp_ptc_pct,
           CAST(i.apr / 1e6 AS decimal(12, 2))                                 AS apr_mm,
           CAST(i.apr / NULLIF(b.act, 0) * 100 AS decimal(6, 1))               AS densidad_pct,
           CAST(b.act / 1e6 AS decimal(12, 2))                                 AS act_mm,
           CAST(b.pat / 1e6 AS decimal(12, 2))                                 AS pat_mm,
           CAST(b.res / 1e6 AS decimal(12, 2))                                 AS res_ytd_mm,
           CAST(b.improd / NULLIF(b.cbruta, 0) * 100 AS decimal(6, 2))         AS moro_pct,
           CAST(b.prov / NULLIF(b.improd, 0) * 100 AS decimal(7, 1))           AS cobert_pct,
           CAST((b.improd - b.prov) / NULLIF(i.ptc, 0) * 100 AS decimal(7, 1)) AS descub_ptc_pct
    FROM ind i
    JOIN bal b ON b.FechaID = i.FechaID
    CROSS JOIN (SELECT Nombre, TipoEntidad FROM dbo.Ifi WHERE IFIID = @IFIID) e
    ORDER BY i.FechaID;
END
GO

/* Pares: las @N entidades del mismo TipoEntidad con activo más cercano (log), al mismo corte. */
CREATE OR ALTER PROCEDURE api.InformeSolvenciaPares
    @IFIID int,
    @Mes   char(7) = NULL,
    @N     int = 10
AS
BEGIN
    SET NOCOUNT ON;
    IF @IFIID IS NULL THROW 50021, N'@IFIID es obligatorio.', 1;
    DECLARE @corte int = api.fnCorteEntidad(@IFIID, @Mes);
    DECLARE @tipo varchar(8) = (SELECT TipoEntidad FROM dbo.Ifi WHERE IFIID = @IFIID);
    DECLARE @ref money = (SELECT Saldo FROM dbo.B11 WHERE IFIID = @IFIID AND FechaID = @corte AND CuentaID = 1);

    WITH ind AS (
        SELECT d.IFIID,
               MAX(CASE WHEN d.IndicadorFinID = 5 THEN d.Valor END) solv,
               MAX(CASE WHEN d.IndicadorFinID = 2 THEN d.Valor END) ptp,
               MAX(CASE WHEN d.IndicadorFinID = 4 THEN d.Valor END) ptc
        FROM dbo.IndicadorData d
        WHERE d.FechaID = @corte
        GROUP BY d.IFIID
    ),
    c AS (
        SELECT i.IFIID, i.Nombre, b.Saldo act, n.solv, n.ptp / NULLIF(n.ptc, 0) ptp_ptc, n.ptc / b.Saldo ptc_act,
               ROW_NUMBER() OVER (ORDER BY ABS(LOG(b.Saldo / @ref))) cerc
        FROM dbo.Ifi i
        JOIN dbo.B11 b ON b.IFIID = i.IFIID AND b.FechaID = @corte AND b.CuentaID = 1 AND b.Saldo > 0
        JOIN ind n ON n.IFIID = i.IFIID
        WHERE i.TipoEntidad = @tipo AND n.solv IS NOT NULL
    )
    SELECT Nombre AS nombre,
           CAST(act / 1e6 AS decimal(12, 1))      AS act_mm,
           CAST(solv * 100 AS decimal(6, 2))       AS solv_pct,
           CAST(ptp_ptc * 100 AS decimal(6, 1))    AS ptp_ptc_pct,
           CAST(ptc_act * 100 AS decimal(6, 2))    AS ptc_act_pct,
           CASE WHEN IFIID = @IFIID THEN 1 ELSE 0 END AS es_entidad
    FROM c
    WHERE cerc <= @N + 1
    ORDER BY solv DESC;
END
GO
