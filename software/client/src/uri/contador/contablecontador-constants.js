import { constantes } from "../constantes"

export const contablecontadorConstants = (id=0, data={}, reset=false) => {
    return {
        url: `${constantes().url_principal[0].url}`,
        get_plan_contable: {
            path: `api/contador/plan-contable-full`,
            stateType: 'get_plan_contable',
            reset: reset,
        }, 
        get_balance_comprobacion: {
            path: `api/contador/balance-comprobacion/${id}`,
            stateType: 'get_balance_comprobacion',
            reset: reset,
        }, 
    }
}