import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { constantes } from '../uri/constantes.js';
import styles from './ResetPasswordPanel.module.css';

export default function ResetPassword(){
  
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden.');
        }

        if (password.length < 6) {
            return setError('La contraseña debe tener al menos 6 caracteres.');
        }

        setLoading(true);

        try {
            const url = `${constantes().url_principal[0].url}/api/auth/reset-password`;
            const res = await axios.post(url, { token, password });

            if (res.data.success) {
                setSuccess(true);
                // Redirigir al login después de 3 segundos
                setTimeout(() => navigate('/login'), 3500);
            }
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al restablecer la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.successIcon}>✓</div>
                    <h2 className={styles.title}>¡Clave Actualizada!</h2>
                    <p className={styles.description}>
                        Tu contraseña ha sido cambiada con éxito. Serás redirigido al inicio de sesión en unos segundos...
                    </p>
                    <Link to="/login" className={styles.loginLink}>Ir al Login ahora</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Nueva Contraseña</h2>
                <p className={styles.description}>Ingresa tu nueva clave de acceso para tu cuenta contable.</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.errorAlert}>{error}</div>}
                    
                    <div className={styles.inputGroup}>
                        <label>Nueva Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Procesando...' : 'Restablecer Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};