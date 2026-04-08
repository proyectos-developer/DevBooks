import { constantes } from "../constantes"

export const comprobantesclienteConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_mis_comprobantes: {
            path: `api/cliente/mis-comprobantes`,
            stateType: 'get_mis_comprobantes',
            reset: reset,
        }, 
    }
}