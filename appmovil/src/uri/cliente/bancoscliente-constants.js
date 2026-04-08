import { constantes } from "../constantes"

export const bancosclienteConstants = (id= 0, data = {}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_listado_bancos: {
            path: `apimovil/cliente/listado-bancos`,
            stateType: 'get_listado_bancos',
            reset: reset,
        },  
    }
}