import { SettingFilled } from "@ant-design/icons";
import { Divider, Typography } from "antd";
import { PageHeader, SectionHeader, DENSIDAD_UI, scalePx, tipografia } from "@idce/kit";

const { Title, Text, Paragraph, Link } = Typography;

const PCT = Math.round(DENSIDAD_UI * 100);

const TypographyScaleDemo = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-cuerpo font-semibold text-tinta-secundaria mb-1">Título de cada vista</p>
        <p className="text-detalle text-tinta-tenue mb-3">
          <code>PageHeader</code> monta <code>Title level={"{4}"}</code> en{" "}
          <code>text-identidad</code> (prussian 700). Tamaño: rol <code>titulo</code>{" "}
          ({tipografia.escala.titulo.tamano} px → {scalePx(tipografia.escala.titulo.tamano)} px a
          densidad {PCT} %). La sección usa <code>Title level={"{5}"}</code>{" "}
          <code>text-tinta</code> ({tipografia.escala.subtitulo.tamano} →{" "}
          {scalePx(tipografia.escala.subtitulo.tamano)} px).
        </p>
        <div className="border border-linea-sutil rounded-tarjeta p-3 bg-superficie-sutil">
          <PageHeader
            titulo="Evolución de incidentes"
            migas={[
              { label: "Inicio", path: "/home" },
              { label: "Informes KRI" },
              { label: "Evolución de incidentes" },
            ]}
          />
          <SectionHeader icono={<SettingFilled />} titulo="Comparativo anual" />
          <p className="text-detalle text-tinta-tenue m-0">
            Mismo patrón en todas las apps del iframe: título de página + título de
            sección.
          </p>
        </div>
      </div>

      <Divider />

      <div>
        <p className="text-cuerpo font-semibold text-tinta-secundaria mb-1">Escala del sistema</p>
        <p className="text-detalle text-tinta-tenue mb-3">
          <code>tipografia.escala</code> se declara a 100 %. En el iframe antd y esta muestra
          aplican <code>scalePx</code> ({PCT} %). Tailwind <code>text-&lt;rol&gt;</code> se queda en
          px de diseño para no bajar <code>rotulo</code> de 11 px. Ver <code>docs/TOKENS.md</code>.
        </p>
        <div className="flex flex-col divide-y divide-linea-sutil">
          <div className="flex items-baseline gap-4 py-1 text-rotulo uppercase tracking-wider text-tinta-tenue">
            <span className="w-32 shrink-0">Rol</span>
            <span className="w-28 shrink-0">Diseño → {PCT} %</span>
            <span>Muestra a densidad {PCT} %</span>
          </div>
          {Object.entries(tipografia.escala).map(([rol, { tamano, interlineado }]) => (
            <div key={rol} className="flex items-baseline gap-4 py-1.5">
              <code className="w-32 shrink-0 text-detalle text-tinta-tenue">text-{rol}</code>
              <span className="w-28 shrink-0 text-detalle text-tinta-tenue">
                {tamano} → {scalePx(tamano)} / {scalePx(interlineado)}
              </span>
              <span
                className="text-tinta truncate"
                style={{ fontSize: scalePx(tamano), lineHeight: `${scalePx(interlineado)}px` }}
              >
                Cartera por oficina 7.65 %
              </span>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      <div>
        <p className="text-cuerpo font-semibold text-tinta-secundaria mb-3">
          Títulos Ant Design (ya van a {PCT} % vía <code>temaAntd</code>)
        </p>
        <div className="flex flex-col gap-2">
          <Title level={4} className="!mb-0 !text-identidad">
            Título de página — Title level={"{4}"} ({scalePx(tipografia.escala.titulo.tamano)} px){" "}
            text-identidad
          </Title>
          <Title level={5} className="!mb-0">
            Título de sección — Title level={"{5}"} ({scalePx(tipografia.escala.subtitulo.tamano)} px)
          </Title>
          <p className="text-detalle text-tinta-tenue m-0">
            No usar level 1–3 en vistas: son login / error / cifra de KPI (
            <code>display</code>, <code>cifra</code>).
          </p>
        </div>
      </div>

      <Divider />

      <div>
        <p className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Textos</p>
        <div className="flex flex-col gap-1">
          <Text className="text-cuerpo font-semibold text-tinta">
            Título de tarjeta o celda — text-cuerpo font-semibold text-tinta (peso, no tamaño)
          </Text>
          <Text className="text-tinta">Texto principal — text-tinta</Text>
          <Text className="text-tinta-secundaria">Texto secundario — text-tinta-secundaria</Text>
          <Text className="text-tinta-tenue">Texto muted — text-tinta-tenue</Text>
          <Text type="secondary">Secondary type Ant Design</Text>
          <Text type="success">Success type</Text>
          <Text type="warning">Warning type</Text>
          <Text type="danger">Danger type</Text>
          <Text disabled>Disabled text</Text>
          <Text code>Code inline</Text>
          <Text keyboard>Ctrl + K</Text>
          <Text mark>Marked text</Text>
          <Text underline>Underlined</Text>
          <Text delete>Deleted</Text>
          <Text strong>Strong</Text>
          <Text italic>Italic</Text>
        </div>
      </div>

      <Divider />

      <div>
        <p className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Párrafos</p>
        <Paragraph>
          Párrafo estándar con <Text strong>Ant Design Typography.Paragraph</Text>. Ideal para
          textos largos, descripciones y contenido informativo en las páginas del SSO.
        </Paragraph>
        <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: "Ver más" }}>
          Párrafo con elipsis automática después de 2 líneas. Esto es útil para descripciones
          largas en listados, tarjetas y vistas previas donde el espacio es limitado y se desea
          mantener la consistencia visual del layout.
        </Paragraph>
      </div>

      <Divider />

      <div>
        <p className="text-cuerpo font-semibold text-tinta-secundaria mb-3">Links</p>
        <div className="flex flex-col gap-1">
          <Link href="https://ant.design" target="_blank">
            Link Ant Design (estándar)
          </Link>
          <a href="#home" className="text-enlace hover:text-enlace-hover">
            Link HTML con el rol enlace (text-enlace)
          </a>
        </div>
      </div>

      <Divider />

      <div>
        <p className="text-cuerpo font-semibold text-tinta-secundaria mb-3">
          Texto monoespaciado (códigos/IDs)
        </p>
        <div className="flex flex-col gap-1">
          <Text code className="font-mono text-cuerpo">
            font-mono text-cuerpo — Código: P-001-2024
          </Text>
          <Text code className="font-mono">
            font-mono — ID: a1b2c3d4-e5f6-7890
          </Text>
        </div>
      </div>
    </div>
  );
};

export default TypographyScaleDemo;
