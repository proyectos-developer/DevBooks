import { constantes } from "../constantes"

export const contableadminConstants = (id= 0, data = {}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_listar_cuentas: {
            path: `apimovil/admin/listar-cuentas`,
            stateType: 'get_listar_cuentas',
            reset: reset,
        },  
    }
}