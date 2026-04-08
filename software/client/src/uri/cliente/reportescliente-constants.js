import { constantes } from "../constantes"

export const reportesclienteConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_mis_reportes: {
            path: `api/cliente/mis-reportes/${id}`,
            stateType: 'get_mis_reportes',
            reset: reset,
        }, 
    }
}