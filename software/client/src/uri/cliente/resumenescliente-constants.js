import { constantes } from "../constantes"

export const resumenesclienteConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_resumenes: {
            path: `api/cliente/resumenes`,
            stateType: 'get_resumenes',
            reset: reset,
        }, 
    }
}