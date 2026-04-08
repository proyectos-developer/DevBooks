import { constantes } from "../constantes"

export const sirecontadorConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_sire_ventas_comparar: {
            path: `api/contador/sire-ventas-comparar/${id}`,
            stateType: 'get_sire_ventas_comparar',
            reset: reset,
        }, 
        get_sire_compras_comparar: {
            path: `api/contador/sire-compras-comparar/${id}`,
            stateType: 'get_sire_compras_comparar',
            reset: reset,
        }, 
    }
}