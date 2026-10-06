import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Drawer, Input, Modal, Segmented, Tag, Tooltip } from "antd";
import { ArrowLeftOutlined, EyeOutlined, ReloadOutlined, SendOutlined } from "@ant-design/icons";
import {
  agenteConfigurado,
  solicitarInforme,
  type Audiencia,
  type ResultadoInforme,
  type SolicitudInforme,
} from "@/services/agenteService";
import { PdfButton, WordButton, showToast } from "@idce/kit";
import KipuMascota from "./KipuMascota";
import InformeKipu from "./InformeKipu";
import { AUDIENCIAS, INFORMES, type InformeCatalogo } from "./catalogoInformes";
import { HOJAS_ORDENADAS, hojaPorNumero } from "../paginas";

/**
 * Kipu: asistente de informes de la revista. Flujo en tres pasos dentro de un Drawer:
 * 1) elegir el informe, 2) personalizar (texto libre + audiencia), 3) ver el resultado.
 * Arma el cuerpo con la metadata que la revista ya tiene (entidad, corte, hoja) para que el
 * workflow no gaste tokens en identificarla. Contrato: docs/agente/CONTRATO_INVOCACION_AGENTE.md.
 */

interface Props {
  /** Nombre visible de la entidad; es igual a `Ifi.Nombre` en la BD. */
  entidad: string;
  /** Id de la API (`COAC___JARDIN_AZUAYO_LIMITADA`). */
  archivo?: string;
  /** Corte elegido en la revista (`AAAA-MM`). */
  corte: string;
  /** Ultimo corte con datos de la entidad. */
  ultimoCorte: string;
  /** Hoja abierta (para trazabilidad del pedido). */
  hoja: number;
  /** Abre una hoja de la revista (enlaces "Valídalo en…"). */
  onIrAHoja?: (numero: number) => void;
  tamano?: string;
  rango?: string;
  provincia?: string;
}

type Paso = "elegir" | "personalizar" | "generando" | "resultado";

type Formato = "word" | "pdf";

/** Lo que el usuario ve mientras espera (el workflow tarda 15–30 s). */
const ETAPAS = ["Consultando la base de datos…", "Calculando indicadores y pares…", "Redactando el informe…", "Dando los últimos retoques…"];

const COLOR_SEMAFORO: Record<string, string> = { ROJO: "error", ÁMBAR: "warning", VERDE: "success" };

const nombreArchivo = (partes: string[]) =>
  partes
    .filter(Boolean)
    .join("_")
    .replace(/[^\w-]+/g, "_")
    .replace(/_+/g, "_");

/** Las hojas por segmento (14-16, 20-22) se ven dentro de la que las reune, como en la revista. */
const REUNIDA: Record<number, number> = { 14: 13, 15: 13, 16: 13, 20: 19, 21: 19, 22: 19 };

/**
 * Hoja tal como aparece en el selector de la revista: posicion en el orden de lectura + nombre
 * ("1. Resumen ejecutivo"), no el numero interno de la hoja (36). Se calcula del indice para que
 * no se desfase si cambia el orden de las secciones.
 */
const hojaEnSelector = (numero: number) => {
  const destino = REUNIDA[numero] ?? numero;
  const pos = HOJAS_ORDENADAS.findIndex((h) => h.numero === destino);
  return pos < 0 ? null : { numero: destino, etiqueta: `${pos + 1}. ${hojaPorNumero(destino)?.nombre ?? ""}` };
};

const HojasValidacion = ({ hojas, onIr }: { hojas: number[]; onIr?: (numero: number) => void }) => {
  const visibles = [...new Map(hojas.map(hojaEnSelector).filter((h) => h !== null).map((h) => [h.numero, h])).values()];
  if (!visibles.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-1 px-3 pb-2 pl-11 text-rotulo text-tinta-tenue">
      Valídalo en:
      {visibles.map((h) =>
        onIr ? (
          <Button key={h.numero} type="link" size="small" className="h-auto px-1 text-rotulo" onClick={() => onIr(h.numero)}>
            {h.etiqueta}
          </Button>
        ) : (
          <span key={h.numero} className="px-1">
            {h.etiqueta}
          </span>
        )
      )}
    </div>
  );
};

const Burbuja = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2">
    <KipuMascota size={36} className="shrink-0" />
    <div className="rounded-tarjeta rounded-tl-none bg-identidad-sutil px-3 py-2 text-cuerpo text-tinta">{children}</div>
  </div>
);

const Kipu = ({ entidad, archivo, corte, ultimoCorte, hoja, onIrAHoja, tamano, rango, provincia }: Props) => {
  const [abierto, setAbierto] = useState(false);
  const [paso, setPaso] = useState<Paso>("elegir");
  const [informe, setInforme] = useState<InformeCatalogo | null>(null);
  const [texto, setTexto] = useState("");
  const [audiencia, setAudiencia] = useState<Audiencia>("gerencia");
  const [resultado, setResultado] = useState<ResultadoInforme | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verInforme, setVerInforme] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const [exportando, setExportando] = useState<Formato | null>(null);
  const sesion = useMemo(() => crypto.randomUUID(), []);
  const solicitud = useRef<AbortController | null>(null);
  const configurado = agenteConfigurado();

  // Mensajes de avance mientras genera; se detiene al terminar.
  useEffect(() => {
    if (paso !== "generando") return;
    const id = setInterval(() => setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1)), 7000);
    return () => clearInterval(id);
  }, [paso]);

  // Si se desmonta la revista con un pedido en curso, se cancela.
  useEffect(() => () => solicitud.current?.abort(), []);

  // Ir a una hoja cierra el panel para que se vea la revista.
  const irAHoja = onIrAHoja
    ? (numero: number) => {
        onIrAHoja(numero);
        setAbierto(false);
        setVerInforme(false);
      }
    : undefined;

  const reiniciar = () => {
    setPaso("elegir");
    setInforme(null);
    setTexto("");
    setResultado(null);
    setError(null);
  };

  const elegir = (i: InformeCatalogo) => {
    setInforme(i);
    setError(null);
    setPaso("personalizar");
  };

  const generar = async () => {
    if (!informe?.tipo) return;
    const cuerpo: SolicitudInforme = {
      version: "1.0",
      solicitud: {
        texto: texto.trim() || `Informe de ${informe.titulo.toLowerCase()} de ${entidad}`,
        tipoInforme: informe.tipo,
        corte,
        parametros: { audiencia },
      },
      entidad: { id: archivo, nombre: entidad, tamano, rango, provincia },
      contexto: { ultimoCorte, origen: { modulo: "analisis", hoja } },
      usuario: { sesion },
      salida: { formato: "html" },
    };
    const control = new AbortController();
    solicitud.current = control;
    setError(null);
    setEtapa(0);
    setPaso("generando");
    try {
      const r = await solicitarInforme(cuerpo, control.signal);
      setResultado(r);
      setPaso("resultado");
      if (r.tipo === "informe") setVerInforme(true);
    } catch (e) {
      if (control.signal.aborted) return;
      const err = e as Error;
      setError(
        err.name === "TimeoutError"
          ? "El informe tardó demasiado. Intenta de nuevo en un momento."
          : err.message === "Failed to fetch"
            ? "No pude conectarme con el servicio de informes. Verifica que n8n esté encendido."
            : err.message
      );
      setPaso("personalizar");
    } finally {
      solicitud.current = null;
    }
  };

  const cancelar = () => {
    solicitud.current?.abort();
    setPaso("personalizar");
  };

  const informeListo = resultado?.tipo === "informe" ? resultado : null;
  const archivoBase = nombreArchivo(["Informe", informeListo?.meta?.tipoInforme ?? informe?.tipo ?? "", entidad, informeListo?.meta?.corte ?? corte]);

  /**
   * Word y PDF se arman desde el informe estructurado (no desde el HTML), con saltos de pagina
   * controlados: ver `exportar/`. Sin `informe` (version vieja del workflow) no hay descargas.
   */
  const exportar = async (formato: Formato) => {
    const estructurado = informeListo?.informe;
    if (!estructurado || exportando) return;
    setExportando(formato);
    try {
      const [{ renderizarGraficos }, exportador] = await Promise.all([
        import("./exportar/imagenesGraficos"),
        formato === "word"
          ? import("./exportar/exportarWord").then((m) => m.exportarWord)
          : import("./exportar/exportarPdf").then((m) => m.exportarPdf),
      ]);
      await exportador(estructurado, await renderizarGraficos(estructurado), archivoBase);
    } catch (e) {
      console.error(e);
      showToast.error(`No se pudo generar el ${formato === "word" ? "Word" : "PDF"}.`);
    } finally {
      setExportando(null);
    }
  };

  const botonesDescarga = informeListo?.informe
    ? [
        <WordButton key="word" loading={exportando === "word"} disabled={!!exportando && exportando !== "word"} onClick={() => exportar("word")} />,
        <PdfButton key="pdf" loading={exportando === "pdf"} disabled={!!exportando && exportando !== "pdf"} onClick={() => exportar("pdf")} />,
      ]
    : [];

  return (
    <>
      <Tooltip title={configurado ? "" : "Falta configurar VITE_AGENTE_INFORMES_URL en /config/routes.json"} placement="left">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          disabled={!configurado}
          aria-label="Abrir Kipu, asistente de informes"
          className="kipu-boton fixed bottom-6 right-6 z-50 flex cursor-pointer items-center gap-2 rounded-full border-2 border-identidad bg-superficie py-1.5 pl-1.5 pr-4 shadow-elevada transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 print:hidden"
        >
          <KipuMascota size={44} />
          <span className="flex flex-col items-start leading-tight">
            <strong className="text-subtitulo text-identidad">Kipu</strong>
            <span className="text-rotulo text-tinta-secundaria">Pídeme un informe</span>
          </span>
        </button>
      </Tooltip>

      <Drawer
        open={abierto}
        onClose={() => setAbierto(false)}
        size={520}
        title={
          <span className="flex items-center gap-2">
            <KipuMascota size={28} pensando={paso === "generando"} />
            <span className="flex flex-col leading-tight">
              <span>Kipu</span>
              <span className="text-rotulo font-normal text-tinta-secundaria">Analista de informes · IDCE Consulting</span>
            </span>
          </span>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1">
            <Tag color="blue">{entidad}</Tag>
            <Tag>Corte {corte}</Tag>
            {tamano && <Tag>{tamano}</Tag>}
          </div>

          {paso === "elegir" && (
            <>
              <Burbuja>
                ¡Hola! Soy <strong>Kipu</strong>. Preparo informes de <strong>{entidad}</strong> al corte <strong>{corte}</strong> con los
                datos del sistema. ¿Cuál necesitas?
              </Burbuja>
              <div className="grid grid-cols-1 gap-2">
                {INFORMES.map((i) => (
                  <div
                    key={i.titulo}
                    className={`flex flex-col rounded-tarjeta border border-linea bg-superficie transition-colors ${i.proximamente ? "opacity-55" : "hover:border-accion-borde-hover hover:bg-accion-sutil"}`}
                  >
                    <button
                      type="button"
                      disabled={i.proximamente}
                      onClick={() => elegir(i)}
                      className="flex cursor-pointer items-start gap-3 border-0 bg-transparent p-3 pb-1 text-left disabled:cursor-not-allowed"
                    >
                      <i.Icono className="mt-0.5 text-titulo text-accion" />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex items-center gap-2 text-cuerpo font-semibold text-tinta">
                          {i.titulo}
                          {i.proximamente && <Tag className="m-0">Próximamente</Tag>}
                        </span>
                        <span className="text-detalle text-tinta-secundaria">{i.descripcion}</span>
                      </span>
                    </button>
                    <HojasValidacion hojas={i.hojas} onIr={irAHoja} />
                  </div>
                ))}
              </div>
            </>
          )}

          {paso === "personalizar" && informe && (
            <>
              <Burbuja>
                ¡Buena elección! Preparo el informe de <strong>{informe.titulo.toLowerCase()}</strong>. Si quieres, cuéntame qué enfocar o
                para quién es; si no, lo hago con el enfoque estándar.
              </Burbuja>
              <Input.TextArea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={`Ej.: ${informe.ejemplo}`}
                maxLength={500}
                showCount
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
              <div className="flex flex-col gap-1">
                <span className="text-detalle text-tinta-secundaria">¿Para quién es? (ajusta el tono)</span>
                <Segmented<Audiencia>
                  block
                  value={audiencia}
                  onChange={setAudiencia}
                  options={AUDIENCIAS.map((a) => ({ value: a.value, label: a.label, icon: <a.Icono /> }))}
                />
              </div>
              {error && <Alert type="error" showIcon title="No pude generar el informe" description={error} />}
              <div className="flex justify-between gap-2">
                <Button icon={<ArrowLeftOutlined />} onClick={reiniciar}>
                  Otro informe
                </Button>
                <Button type="primary" icon={<SendOutlined />} onClick={generar}>
                  Generar informe
                </Button>
              </div>
            </>
          )}

          {paso === "generando" && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <KipuMascota size={96} pensando />
              <div className="flex flex-col gap-1">
                <strong className="text-subtitulo text-tinta">{ETAPAS[etapa]}</strong>
                <span className="text-detalle text-tinta-secundaria">Suele tomar entre 15 y 30 segundos.</span>
              </div>
              <Button onClick={cancelar}>Cancelar</Button>
            </div>
          )}

          {paso === "resultado" && resultado?.tipo === "pregunta" && (
            <>
              <Burbuja>{resultado.texto}</Burbuja>
              <div className="flex justify-between gap-2">
                <Button icon={<ArrowLeftOutlined />} onClick={reiniciar}>
                  Elegir otro informe
                </Button>
                <Button onClick={() => setPaso("personalizar")}>Ajustar el pedido</Button>
              </div>
            </>
          )}

          {paso === "resultado" && informeListo && (
            <>
              <Burbuja>
                ¡Listo! Aquí tienes el informe de <strong>{informe?.titulo.toLowerCase()}</strong> de {informeListo.meta?.entidad ?? entidad} al
                corte {informeListo.meta?.corte ?? corte}.
              </Burbuja>
              <div className="flex flex-col gap-2 rounded-tarjeta border border-linea p-3">
                <span className="flex flex-wrap items-center gap-2 text-cuerpo font-semibold text-tinta">
                  {informeListo.meta?.titulo ?? informe?.titulo}
                  {informeListo.meta?.semaforo && (
                    <Tag color={COLOR_SEMAFORO[informeListo.meta.semaforo] ?? "default"}>Semáforo {informeListo.meta.semaforo}</Tag>
                  )}
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button type="primary" icon={<EyeOutlined />} onClick={() => setVerInforme(true)}>
                    Ver informe
                  </Button>
                  {botonesDescarga}
                </div>
                {informe && <HojasValidacion hojas={informe.hojas} onIr={irAHoja} />}
              </div>
              <Button icon={<ReloadOutlined />} onClick={reiniciar}>
                Pedir otro informe
              </Button>
            </>
          )}
        </div>
      </Drawer>

      <Modal
        open={verInforme && !!informeListo}
        onCancel={() => setVerInforme(false)}
        width="min(1000px, 95vw)"
        title={informeListo?.meta?.titulo ?? informe?.titulo}
        footer={botonesDescarga.length ? botonesDescarga : null}
      >
        {informeListo?.informe ? (
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            <InformeKipu informe={informeListo.informe} />
          </div>
        ) : informeListo && (
          // Version vieja del workflow (solo HTML): se muestra tal cual, sin descargas. Sandbox
          // vacio: el HTML del informe no ejecuta nada.
          <iframe
            title={informeListo.meta?.titulo ?? "Informe"}
            srcDoc={informeListo.html}
            sandbox=""
            className="h-[75vh] w-full rounded-tarjeta border border-linea bg-superficie"
          />
        )}
      </Modal>
    </>
  );
};

export default Kipu;
