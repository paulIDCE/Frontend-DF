export interface NivelRiesgo {
    nivelRiesgoID: number;
    configuracionLimiteID: number;
    nombre: string;
    descripcion: string;
    rangoInicio: number;
    rangoFin: number;
    fechaLog: string;
    color: string;
    estado: string;
}