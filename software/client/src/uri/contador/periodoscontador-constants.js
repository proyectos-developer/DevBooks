import { constantes } from "../constantes"

export const periodoscontadorConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_periodos_all: {
            path: `api/contador/periodos-all`,
            stateType: 'get_periodos_all',
            reset: reset,
        }, 
    }
}