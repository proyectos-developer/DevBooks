import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './Header.module.css';

export default function Header({ onMenuClick }) {
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
                    <div className={styles.logoSquare}>DI</div>
                    <div className={styles.brandInfo}>
                        <h1 className={styles.mainTitle}>Developer Ideas</h1>
                        <div className={styles.statusIndicator}>
                            <span className={styles.dot}></span>
                            <span className={styles.subTitle}>Sistema Contable v2.0</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.rightSection}>
                {/* Badge de Empresa - Muy útil para multi-tenant */}
                <div className={styles.companyBadge}>
                    <span className={styles.rucText}>{user?.ruc || 'RUC'}</span>
                    <span className={styles.companyName}>{user?.razonSocial || 'Empresa Administradora'}</span>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.userProfile}>
                    <div className={styles.userMeta}>
                        <span className={styles.userName}>{user?.nombre} {user?.apellido}</span>
                        <span className={styles.userRole}>{user?.rol}</span>
                    </div>
                    <div className={styles.avatarWrapper}>
                        <div className={styles.userAvatar}>
                            {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                        </div>
                        <div className={styles.onlineBadge}></div>
                    </div>
                </div>

                <button onClick={logout} className={styles.logoutBtn} title="Finalizar Sesión">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        </header>
    );
}