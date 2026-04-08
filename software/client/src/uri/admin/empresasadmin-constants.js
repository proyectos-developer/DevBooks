import { constantes } from "../constantes"

export const empresasadminConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_empresas: {
            path: `api/admin/empresas`,
            stateType: 'get_empresas',
            reset: reset,
        }, 
        get_empresa: {
            path: `api/admin/empresa/${id}`,
            stateType: 'get_empresa',
            reset: reset,
        }, 
    }
}