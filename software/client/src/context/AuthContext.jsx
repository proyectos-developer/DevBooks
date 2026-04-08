import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { constantes } from '../uri/constantes.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const api = axios.create({
        baseURL: `${constantes().url_principal[0].url}`
    });

    const normalizarUsuario = (userData) => {
        if (!userData) return null;
        return {
            ...userData,
            primerIngreso: userData.primerIngreso === true || userData.primerIngreso === 1 || userData.primerIngreso === "1",
            nombreCompleto: `${userData.nombre} ${userData.apellido}`,
            // Importante para el software contable:
            empresaId: userData.id_empresa, 
            ruc_empresa: userData.ruc
        };
    };

    useEffect(() => {
        const cargarUsuario = async () => {
            const token = localStorage.getItem('token_contable');
            if (token) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const res = await api.get(`${constantes().url_principal[0].url}/api/auth/usuario`); 
                    if (res.data.success) {
                        setUser(normalizarUsuario(res.data.usuario));
                    }
                } catch (error) {
                    console.error("Error en sesión contable:", error);
                    logout();
                }
            }
            setLoading(false);
        };
        cargarUsuario();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${constantes().url_principal[0].url}/api/auth/login`, { email, password });
            if (res.data.success) {
                const usuarioOk = normalizarUsuario(res.data.user);
                localStorage.setItem('token_contable', res.data.token);
                localStorage.setItem('dev_cont_user', JSON.stringify(usuarioOk));
                api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                setUser(usuarioOk);
                return { success: true };
            }
        } catch (error) {
            return { success: false, mensaje: error.response?.data?.mensaje || 'Error de acceso' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token_contable');
        localStorage.removeItem('dev_cont_user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, logout, api }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);