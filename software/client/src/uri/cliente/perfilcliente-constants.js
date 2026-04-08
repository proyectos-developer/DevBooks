import { constantes } from "../constantes"

export const perfilclienteConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_mi_perfil: {
            path: `api/cliente/perfil`,
            stateType: 'get_mi_perfil',
            reset: reset,
        }, 
    }
}