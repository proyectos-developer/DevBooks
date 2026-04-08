import { constantes } from "../constantes"

export const perfilcontadorConstants = (id= 0, data = {}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_mi_perfil: {
            path: `apimovil/contador/perfil`,
            stateType: 'get_mi_perfil',
            reset: reset,
        },  
        get_notificaciones: {
            path: `apimovil/contador/notificaciones`,
            stateType: 'get_notificaciones',
            reset: reset,
        },  
        get_sistema_info: {
            path: `apimovil/contador/sistema/info`,
            stateType: 'get_sistema_info',
            reset: reset,
        },  
    }
}