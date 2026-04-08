import { constantes } from "../constantes"

export const entidadescontadorConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_entidades: {
            path: `api/contador/entidades`,
            stateType: 'get_entidades',
            reset: reset,
        }, 
        get_detalle_entidad: {
            path: `api/contador/entidad/${id}`,
            stateType: 'get_detalle_entidad',
            reset: reset,
        }, 
        get_historial_entidad: {
            path: `api/contador/entidad-historial/${id}`,
            stateType: 'get_historial_entidad',
            reset: reset,
        }, 
    }
}