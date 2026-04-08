import { constantes } from "../constantes"

export const reportesclienteConstants = (id= 0, data = {}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_reportes_sire: {
            path: `apimovil/cliente/reportes/sire${data}`,
            stateType: 'get_reportes_sire',
            reset: reset,
        },  
        get_detalle_reporte: {
            path: `apimovil/cliente/reporte/detalles/${id}`,
            stateType: 'get_detalle_reporte',
            reset: reset,
        },  
    }
}