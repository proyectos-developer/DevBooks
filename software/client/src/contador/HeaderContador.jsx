import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './Header.module.css';

export default function HeaderContador({ onMenuClick }) {
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
                    <div className={styles.logoSquare} style={{background: '#10b981'}}>DI</div>
                    <div className={styles.brandInfo}>
                        <h1 className={styles.mainTitle}>Developer Ideas</h1>
                        <div className={styles.statusIndicator}>
                            <span className={styles.dot}></span>
                            <span className={styles.subTitle}>Panel del Contador</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.rightSection}>
                {/* Visualización clara de la empresa actual */}
                <div className={styles.companyBadge} style={{borderLeft: '4px solid #10b981'}}>
                    <span className={styles.rucText}>EMPRESA ACTUAL:</span>
                    <span className={styles.companyName}>{user?.razonSocial || 'Cargando empresa...'}</span>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.userProfile}>
                    <div className={styles.userMeta}>
                        <span className={styles.userName}>{user?.nombre} {user?.apellido}</span>
                        <span className={styles.userRole} style={{color: '#10b981'}}>{user?.rol}</span>
                    </div>
                    <div className={styles.avatarWrapper}>
                        <div className={styles.userAvatar} style={{borderColor: '#d1fae5', color: '#059669'}}>
                            {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                        </div>
                    </div>
                </div>

                <button onClick={logout} className={styles.logoutBtn} title="Cerrar Sistema">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        </header>
    );
}