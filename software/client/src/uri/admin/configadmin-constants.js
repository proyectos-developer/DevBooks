import { constantes } from "../constantes"

export const configadminConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_configuracion: {
            path: `api/admin/configuracion`,
            stateType: 'get_configuracion',
            reset: reset,
        }, 
    }
}