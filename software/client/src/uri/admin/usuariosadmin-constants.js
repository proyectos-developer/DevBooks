import { constantes } from "../constantes"

export const usuariosadminConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_usuarios: {
            path: `api/admin/usuarios`,
            stateType: 'get_usuarios',
            reset: reset,
        }, 
        get_detalle_usuario: {
            path: `api/admin/usuario/${id}`,
            stateType: 'get_detalle_usuario',
            reset: reset,
        }, 
    }
}