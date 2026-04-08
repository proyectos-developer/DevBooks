import { constantes } from "../constantes"

export const resumenescontadorConstants = (id= 0, data = {}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_resumenes: {
            path: `apimovil/contador/resumenes`,
            stateType: 'get_resumenes',
            reset: reset,
        },  
        get_libro_diario: {
            path: `apimovil/contador/libro-diario${data}`,
            stateType: 'get_libro_diario',
            reset: reset,
        },  
        get_detalle_asiento: {
            path: `apimovil/contador/asiento-detalle/${id}`,
            stateType: 'get_detalle_asiento',
            reset: reset,
        },  
    }
}