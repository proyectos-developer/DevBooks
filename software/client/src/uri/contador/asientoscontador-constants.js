import { constantes } from "../constantes"

export const asientoscontadorConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_asientos: {
            path: `api/contador/asientos`,
            stateType: 'get_asientos',
            reset: reset,
        }, 
        get_detalle_asiento: {
            path: `api/contador/asiento-detalle/${id}`,
            stateType: 'get_detalle_asiento',
            reset: reset,
        }, 
    }
}