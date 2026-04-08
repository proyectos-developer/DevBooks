import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { constantes } from '../uri/constantes.js';
import styles from './ForgotPasswordPanel.module.css';

export default function ForgotPassword(){
  
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const url = `${constantes().url_principal[0].url}/api/auth/forgot-password`;
            const res = await axios.post(url, { email });
            
            if (res.data.success) {
                setMessage(res.data.mensaje);
            }
        } catch (err) {
            setError('Ocurrió un error al procesar tu solicitud. Inténtalo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>¿Olvidaste tu contraseña?</h2>
                <p className={styles.description}>
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu acceso al sistema contable.
                </p>

                {message ? (
                    <div className={styles.successBox}>
                        <p>{message}</p>
                        <Link to="/login" className={styles.backButton}>Volver al Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={styles.errorAlert}>{error}</div>}
                        
                        <div className={styles.inputGroup}>
                            <label>Correo Electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                required
                            />
                        </div>

                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </button>

                        <div className={styles.footer}>
                            <Link to="/login" className={styles.link}>Regresar al inicio de sesión</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};