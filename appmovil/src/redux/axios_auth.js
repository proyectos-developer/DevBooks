import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { constantes } from '../uri/constantes';

const api = axios.create({
    // Asegúrate de que esta IP sea la actual de tu PC si usas un dispositivo físico
    baseURL: `${constantes().url_principal[0].url}` 
});

api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        } catch (error) {
            console.error("Error obteniendo el token del storage:", error);
            return config; // Retornamos config para no bloquear la petición
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;