import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStorageData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                const storedUser = await AsyncStorage.getItem('userData');
                
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error('Error al recuperar la sesión de DevBooks:', e);
            } finally {
                setTimeout(() => setIsLoading(false), 500);
            }
        };
        loadStorageData();
    }, []);

    const login = async (userData, userToken) => {
        setIsLoading(true);
        try {
            setToken(userToken);
            setUser(userData); 
            
            await AsyncStorage.setItem('userToken', userToken);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await AsyncStorage.multiRemove(['userToken', 'userData']);
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Actualizar info del usuario (nombre, apellido, o empresa actual)
    const updateUserInfo = async (newUserData) => {
        try {
            const updatedUser = { ...user, ...newUserData };
            setUser(updatedUser);
            await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Error al actualizar datos de perfil:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            isLoading, 
            login, 
            logout, 
            setUser,
            updateUserInfo 
        }}>
            {children}
        </AuthContext.Provider>
    );
};