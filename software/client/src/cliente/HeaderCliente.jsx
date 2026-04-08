import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './HeaderCliente.module.css';

export default function HeaderCliente({ onMenuClick }) {
    const { user, logout } = useAuth();

    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <button className={styles.burgerBtn} onClick={onMenuClick} aria-label="Abrir menú">
                    <span className={styles.burgerLine}></span>
                    <span className={styles.burgerLine}></span>
                    <span className={styles.burgerLine}></span>
                </button>
                
                <div className={styles.brand}>
                    <div className={styles.logoCircle}>AC</div>
                    <div className={styles.brandText}>
                        <h1 className={styles.title}>Agro Conecta</h1>
                        <span className={styles.tagline}>Portal del Cliente</span>
                    </div>
                </div>
            </div>

            <div className={styles.rightSection}>
                <div className={styles.userInfo}>
                    <div className={styles.textDetails}>
                        <span className={styles.userName}>{user?.nombre}</span>
                        <span className={styles.userCompany}>{user?.razonSocial || 'Mi Empresa'}</span>
                    </div>
                    <div className={styles.avatar}>
                        {user?.nombre?.charAt(0)}
                    </div>
                </div>

                <button onClick={logout} className={styles.logoutIcon} title="Salir">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>
        </header>
    );
}