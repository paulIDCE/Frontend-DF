import { useState } from "react";
import { Switch } from "antd";
import {
  AlertOutlined,
  BankOutlined,
  PercentageOutlined,
  QuestionCircleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { KpiCard, Delta, FilaKpis, fmtFechaID, fmtMonedaCorta, fmtPct, nivelDe } from "@idce/kit";
import { MOCK_COLOR_CATALOGO, MOCK_CORTES, MOCK_NIVELES, MOCK_OFICINAS } from "@/mocks/analitica";
import GuiaUso from "./GuiaUso";

const ultimo = MOCK_CORTES[MOCK_CORTES.length - 1];
const anterior = MOCK_CORTES[MOCK_CORTES.length - 2];
const nivel = nivelDe(ultimo.mora, MOCK_NIVELES);

/**
 * KPIs de vistas analiticas: `KpiCard` + `FilaKpis`. La misma fila que usa la pestaña
 * "Vista analítica", separada aqui para ver cada variante de color y cuando usarla.
 */
const KpiCardsDemo = () => {
  const [cargando, setCargando] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria m-0">Una fila por vista, cuatro cifras como máximo</h4>
        <span className="flex items-center gap-1.5 text-detalle text-tinta-tenue">
          <Switch size="small" checked={cargando} onChange={setCargando} /> Simular carga
        </span>
      </div>

      <FilaKpis cargando={cargando}>
        <KpiCard
          titulo="Monto"
          valor={fmtMonedaCorta(ultimo.saldo)}
          color="monto"
          icono={<BankOutlined />}
          valorSecundario={
            <Delta valor={((ultimo.saldo - anterior.saldo) / anterior.saldo) * 100} sufijo="%" etiqueta="vs. corte anterior" />
          }
          pie={`Corte ${fmtFechaID(ultimo.fechaCorteID, "MMM-yyyy")}`}
        />
        <KpiCard
          titulo="Riesgo · color del nivel"
          ayuda="Cartera vencida / cartera total. Color propio: el del nivel, que viene del backend; KpiCard lo oscurece si no se lee"
          valor={fmtPct(ultimo.mora)}
          color={nivel?.color ?? "neutro"}
          icono={<PercentageOutlined />}
          valorSecundario={<Delta valor={ultimo.mora - anterior.mora} sufijo=" pp" etiqueta="vs. corte anterior" subirEsMalo />}
          pie={nivel ? `Nivel ${nivel.nombre}` : "Sin nivel"}
        />
        <KpiCard
          titulo="Contra meta · bueno / malo"
          valor={fmtPct(ultimo.cobertura)}
          color={ultimo.cobertura >= 100 ? "bueno" : "malo"}
          icono={<SafetyOutlined />}
          valorSecundario={<Delta valor={ultimo.cobertura - anterior.cobertura} sufijo=" pp" etiqueta="vs. corte anterior" />}
          pie="Meta: 100 %"
        />
        <KpiCard
          titulo="Conteo · riesgo"
          valor={MOCK_OFICINAS.filter((o) => o.mora >= 5).length}
          sufijo={`de ${MOCK_OFICINAS.length}`}
          color="riesgo"
          icono={<AlertOutlined />}
          etiquetaSecundaria="oficinas con mora ≥ 5 %"
          pie="Según los filtros aplicados"
        />
      </FilaKpis>

      <FilaKpis cargando={cargando} cantidad={1}>
        <KpiCard
          titulo="Sin dato · neutro"
          valor="—"
          color="neutro"
          icono={<QuestionCircleOutlined />}
          etiquetaSecundaria="Delta no pinta nada si el valor es null"
          pie="Nunca 0 cuando no hay dato"
        />
      </FilaKpis>

      <div className="flex flex-col gap-2">
        <h4 className="text-cuerpo font-semibold text-tinta-secundaria m-0">Ajustes: columnas y color propio</h4>
        <p className="text-detalle text-tinta-tenue m-0">
          <code>FilaKpis columnas</code> cambia cuántas caben por fila en laptop (4 por defecto). El color acepta un rol
          (<code>"monto"</code>, <code>"riesgo"</code>, <code>"bueno"</code>, <code>"malo"</code>, <code>"accion"</code>…) o un
          color propio cuando lo dicta el dato.
        </p>
      </div>

      <FilaKpis cargando={cargando} columnas={3}>
        <KpiCard titulo="3 por fila · rol accion" valor={MOCK_OFICINAS.length} sufijo="oficinas" color="accion" etiquetaSecundaria="con cartera vigente" />
        <KpiCard titulo="3 por fila · rol exito" valor={fmtPct(ultimo.cobertura)} color="exito" etiquetaSecundaria="cobertura del corte" />
        <KpiCard
          titulo="Color propio · catálogo"
          ayuda="El color llega del backend (configuración del producto). Úsalo solo cuando lo dicta el dato."
          valor={fmtMonedaCorta(ultimo.saldo * 0.18)}
          color={MOCK_COLOR_CATALOGO}
          icono={<BankOutlined />}
          etiquetaSecundaria="producto Microcrédito"
        />
      </FilaKpis>

      <FilaKpis cargando={cargando} columnas={5}>
        {MOCK_OFICINAS.slice(0, 5).map((o) => (
          <KpiCard
            key={o.oficinaID}
            titulo={o.nombre}
            valor={fmtPct(o.mora)}
            color={nivelDe(o.mora, MOCK_NIVELES)?.color ?? "neutro"}
            etiquetaSecundaria="mora · 5 por fila"
          />
        ))}
      </FilaKpis>

      <GuiaUso
        usar={[
          "Cifras de cabecera de una vista analítica: lo primero que se lee tras Filtrar.",
          <>Siempre con base de comparación en <code>Delta</code> ("vs. corte anterior", "mes", "año").</>,
          <>Color por significado con el rol: <code>color="monto"</code>, <code>"riesgo"</code>, <code>"bueno"</code> / <code>"malo"</code> contra una meta, <code>"neutro"</code> sin dato. Salen de los tokens.</>,
          <>Color propio solo si viene del dato (nivel de riesgo, catálogo): <code>KpiCard</code> lo oscurece solo si no se lee sobre blanco.</>,
          <><code>FilaKpis columnas</code> para 3, 5 o 6 por fila cuando la vista lo pide; 4 es el estándar.</>,
          <><code>subirEsMalo</code> en mora y riesgo: una subida se pinta en rojo.</>,
        ]}
        evitar={[
          "Una lista larga de valores por oficina, producto, etc. → tabla. Más de 5 por fila deja tarjetas angostas a 1264 px.",
          <>Un color propio para algo que ya tiene rol (un monto en violeta porque sí): rompe el significado del color.</>,
          <>Agrupar contenido, formularios o configuración → <code>Card</code> de antd (arriba).</>,
          "Cifras sin contexto (sin variación, meta ni corte): no se pueden interpretar.",
          <>Filas de KPIs armadas a mano con <code>Row</code>/<code>Col</code> → <code>FilaKpis</code> (misma rejilla y esqueleto).</>,
        ]}
        pieza={
          <>
            <code>KpiCard</code> + <code>FilaKpis</code>, <code>Delta</code> de <code>@idce/kit</code>; roles en <code>COLOR_ROL</code>
          </>
        }
      />
    </div>
  );
};

export default KpiCardsDemo;
