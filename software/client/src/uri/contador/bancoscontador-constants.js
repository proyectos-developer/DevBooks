import { constantes } from "../constantes"

export const bancoscontadorConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_conciliacion: {
            path: `api/contador/conciliacion/${id}`,
            stateType: 'get_conciliacion',
            reset: reset,
        }, 
    }
}