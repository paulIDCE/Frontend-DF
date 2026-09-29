import { Component, ReactNode } from "react";
import { Alert, Button } from "antd";

interface Props {
  children: ReactNode;
  /** Al cambiar, se reintenta pintar (p. ej. nuevos filtros o tipo de mora). */
  claveReinicio?: string;
}

interface Estado {
  error: Error | null;
  clave?: string;
}

/**
 * Aisla cada pestaña: si una grafica falla al pintarse, se muestra el aviso en su lugar y el
 * resto de la vista (filtros, indicadores, otras pestañas) sigue funcionando. Sin esto, un error
 * de ECharts dejaba la pantalla completa en blanco.
 */
class LimiteError extends Component<Props, Estado> {
  state: Estado = { error: null, clave: this.props.claveReinicio };

  static getDerivedStateFromError(error: Error): Partial<Estado> {
    return { error };
  }

  static getDerivedStateFromProps(props: Props, estado: Estado): Partial<Estado> | null {
    return props.claveReinicio !== estado.clave ? { error: null, clave: props.claveReinicio } : null;
  }

  componentDidCatch(error: Error) {
    console.error("[VistaAnalitica] Error al pintar la sección:", error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Alert
        type="error"
        showIcon
        title="No se pudo mostrar esta sección"
        description={this.state.error.message}
        action={
          <Button size="small" onClick={() => this.setState({ error: null })}>
            Reintentar
          </Button>
        }
      />
    );
  }
}

export default LimiteError;
