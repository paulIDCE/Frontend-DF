/**
 * Kipu, el analista de IDCE Consulting. Su nombre viene del khipu andino: cordeles con nudos con
 * los que se llevaban las cuentas. Los tres cordeles de colores bajo su cara son ese khipu.
 * Colores desde los tokens (`--color-*`), sin hex sueltos.
 */
interface Props {
  size?: number;
  /** Parpadea y mueve los cordeles mientras trabaja. */
  pensando?: boolean;
  className?: string;
}

const KipuMascota = ({ size = 48, pensando = false, className }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    role="img"
    aria-label="Kipu, asistente de informes"
    className={`${pensando ? "kipu-pensando" : ""} ${className ?? ""}`}
  >
    {/* antena con nudo */}
    <line x1="32" y1="6" x2="32" y2="14" stroke="var(--color-identidad)" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="32" cy="5" r="3.2" fill="var(--color-advertencia)" />
    {/* cara */}
    <rect x="10" y="13" width="44" height="34" rx="14" fill="var(--color-identidad)" />
    <rect x="15" y="18" width="34" height="22" rx="10" fill="var(--color-superficie)" />
    {/* ojos */}
    <g className="kipu-ojos">
      <ellipse cx="25" cy="28" rx="3.2" ry="3.8" fill="var(--color-identidad)" />
      <ellipse cx="39" cy="28" rx="3.2" ry="3.8" fill="var(--color-identidad)" />
      <circle cx="26.2" cy="26.6" r="1.1" fill="var(--color-superficie)" />
      <circle cx="40.2" cy="26.6" r="1.1" fill="var(--color-superficie)" />
    </g>
    {/* mejillas y sonrisa */}
    <circle cx="19.5" cy="34" r="2" fill="var(--color-error-borde)" />
    <circle cx="44.5" cy="34" r="2" fill="var(--color-error-borde)" />
    <path d="M27 34.5 Q32 38.5 37 34.5" fill="none" stroke="var(--color-identidad)" strokeWidth="2" strokeLinecap="round" />
    {/* khipu: tres cordeles con nudos */}
    <g className="kipu-cordeles">
      <path d="M22 47 q-2 6 0 12" fill="none" stroke="var(--color-accion)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="21.2" cy="52" r="2" fill="var(--color-accion)" />
      <path d="M32 47 q2 5 0 13" fill="none" stroke="var(--color-exito)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32.8" cy="51" r="2" fill="var(--color-exito)" />
      <circle cx="32.4" cy="56.5" r="2" fill="var(--color-exito)" />
      <path d="M42 47 q-2 5 0 10" fill="none" stroke="var(--color-advertencia)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="41.3" cy="53" r="2" fill="var(--color-advertencia)" />
    </g>
  </svg>
);

export default KipuMascota;
