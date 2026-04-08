import { constantes } from "../constantes"

export const configuracionadminConstants = (id= 0, data = {}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_configuracion: {
            path: `apimovil/admin/config`,
            stateType: 'get_configuracion',
            reset: reset,
        },  
    }
}