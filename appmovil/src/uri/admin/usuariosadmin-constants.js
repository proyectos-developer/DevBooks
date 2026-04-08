import { constantes } from "../constantes"

export const usuariosadminConstants = (id= 0, data = {}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_listar_usuarios: {
            path: `apimovil/admin/listar-usuarios`,
            stateType: 'get_listar_usuarios',
            reset: reset,
        },  
    }
}