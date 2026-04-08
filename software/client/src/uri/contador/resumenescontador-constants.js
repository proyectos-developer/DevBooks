import { constantes } from "../constantes"

export const resumenescontadorConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_resumenes: {
            path: `api/contador/resumenes`,
            stateType: 'get_resumenes',
            reset: reset,
        }, 
        get_reportes_resumen: {
            path: `api/contador/reportes-resumen`,
            stateType: 'get_reportes_resumen',
            reset: reset,
        }, 
    }
}