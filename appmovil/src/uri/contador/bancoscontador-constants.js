import { constantes } from "../constantes"

export const bancoscontadorConstants = (id= 0, data = {}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_bancos: {
            path: `apimovil/contador/bancos`,
            stateType: 'get_bancos',
            reset: reset,
        },  
        get_movimientos_banco: {
            path: `apimovil/contador/banco/movimientos/${id}`,
            stateType: 'get_movimientos_banco',
            reset: reset,
        },  
    }
}