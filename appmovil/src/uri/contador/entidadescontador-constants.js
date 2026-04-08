import { constantes } from "../constantes"

export const entidadescontadorConstants = (id= 0, data = {}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_entidades: {
            path: `apimovil/contador/entidades`,
            stateType: 'get_entidades',
            reset: reset,
        },  
        get_detalles_entidad: {
            path: `apimovil/contador/entidad/${id}`,
            stateType: 'get_detalles_entidad',
            reset: reset,
        },   
        get_movimientos_entidad: {
            path: `apimovil/contador/entidad/${id}/movimientos`,
            stateType: 'get_movimientos_entidad',
            reset: reset,
        },  
    }
}