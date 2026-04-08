import axios from 'axios'
import { constantes } from '../uri/constantes'

const api = axios.create ({
    baseURL: `${constantes().url_principal[0].url}`
})

api.interceptors.request.use(
    (config) => {
        const token = window.localStorage.getItem ('token_contable')

        if (token){
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api;

//http://localhost:3001