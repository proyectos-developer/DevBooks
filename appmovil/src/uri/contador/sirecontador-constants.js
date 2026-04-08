import { constantes } from "../constantes"

export const sirecontadorConstants = (id= 0, data = {}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_sire_resumenes: {
            path: `apimovil/contador/sire/resumen${data}`,
            stateType: 'get_sire_resumenes',
            reset: reset,
        },  
        get_detalle_sire: {
            path: `apimovil/contador/sire/detalle/${id}`,
            stateType: 'get_detalle_sire',
            reset: reset,
        },  
    }
}