import { constantes } from "../constantes"

export const resumenesadminConstants = (id= 0, data = {}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_resumenes: {
            path: `apimovil/admin/resumenes`,
            stateType: 'get_resumenes',
            reset: reset,
        },  
        get_asiento_detalles: {
            path: `apimovil/admin/asiento-detalle/${id}`,
            stateType: 'get_asiento_detalles',
            reset: reset,
        },  
        get_listar_asientos: {
            path: `apimovil/admin/listar-asientos${data}`,
            stateType: 'get_listar_asientos',
            reset: reset,
        },  
    }
}