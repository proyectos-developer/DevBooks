import { constantes } from "./constantes"

export const beginConstants = (data = {}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        signin: {
            path: `api/auth/login`,
            stateType: 'signin',
            reset: reset,
            data: data
        }, 
        forgot_password: {
            path: `api/auth/forgot/password`,
            stateType: 'forgot_password',
            reset: reset,
            data: data
        },  
        reset_password: {
            path: `api/auth/reset/password`,
            stateType: 'reset_password',
            reset: reset,
            data: data
        },  
        logout: {
            path: `api/auth/logout`,
            stateType: 'logout',
            reset: reset,
        },  
    }
}