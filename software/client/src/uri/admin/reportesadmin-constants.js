import { constantes } from "../constantes"

export const reportesadminConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_reportes_globales: {
            path: `api/admin/reportes-globales`,
            stateType: 'get_reportes_globales',
            reset: reset,
        }, 
        get_reporte_detalle: {
            path: `api/admin/reportes-detalle/${id}`,
            stateType: 'get_reporte_detalle',
            reset: reset,
        }, 
    }
}