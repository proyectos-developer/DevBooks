import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPanel.module.css';
import logoDevBooks from '../assets/DevBooks512.png'; 

export default function LoginPanel() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.mensaje);
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <img src={logoDevBooks} alt="DevBooks Logo" className={styles.logo} />
                    <h1 className={styles.title}>DevBooks</h1>
                    <p className={styles.subtitle}>Gestión Contable Inteligente</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.errorAlert}>{error}</div>}
                    
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="usuario@devbooks.pe"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className={styles.forgotContainer}>
                        <Link to="/forgot-password" className={styles.forgotLink}>
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        className={styles.loginButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Iniciando sesión...' : 'Entrar al Sistema'}
                    </button>
                </form>
            </div>
            <footer className={styles.footer}>
                Desarrollado por <strong>Developer Ideas E.I.R.L.</strong> &copy; {new Date().getFullYear()}
            </footer>
        </div>
    );
}