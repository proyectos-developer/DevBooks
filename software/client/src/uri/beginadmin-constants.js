import { constantes } from "./constantes"

export const beginadminConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        registrar_usuario: {
            path: `api/admin/usuario/registrar`,
            stateType: 'registrar_usuario',
            reset: reset,
            data: data
        }, 
    }
}