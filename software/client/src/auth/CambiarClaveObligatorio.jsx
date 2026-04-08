import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { constantes } from '../uri/constantes.js';
import styles from './CambiarClaveObligatorio.module.css';
import { useAuth } from '../context/AuthContext.jsx';

export default function CambiarClaveObligatorio (){

    const { user, setUser, logout } = useAuth();
  
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
  
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden.');
        }

        if (password.length < 8) {
            return setError('Por seguridad, la clave debe tener al menos 8 caracteres.');
        }

        setLoading(true);

        try {
            const url = `${constantes().url_principal[0].url}/api/auth/cambiar-clave-obligatorio`;
            const res = await axios.post(url, { 
                id: user.id, // Tomamos el ID del contexto de Auth
                password 
            });

            if (res.data.success) {
                // Actualizamos el estado del usuario localmente para quitar el flag de primerIngreso
                const updatedUser = { ...user, primerIngreso: false };
                setUser(updatedUser);
                localStorage.setItem('dev_cont_user', JSON.stringify(updatedUser));
                
                // Redirigimos al dashboard principal según su rol
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al actualizar la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconBox}>🔑</div>
                <h2 className={styles.title}>Actualización de Seguridad</h2>
                <p className={styles.description}>
                    Hola <strong>{user?.nombre}</strong>, por políticas de seguridad de Developer Ideas, debes cambiar tu contraseña temporal antes de continuar.
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.errorAlert}>{error}</div>}
                    
                    <div className={styles.inputGroup}>
                        <label>Nueva Contraseña Personal</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 8 caracteres"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite tu contraseña"
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Actualizando...' : 'Establecer nueva contraseña'}
                    </button>

                    <button 
                        type="button" 
                        onClick={logout} 
                        className={styles.logoutButton}
                    >
                        Cerrar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
};