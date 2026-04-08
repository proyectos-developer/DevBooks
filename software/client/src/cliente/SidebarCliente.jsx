import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './SidebarCliente.module.css';

export default function SidebarCliente({ isOpen, onClose }) {
    const location = useLocation();

    const opciones = [
        { path: '/', label: 'Panel de Inicio', icon: '🏠' },
        { path: '/cliente/mis-facturas', label: 'Mis Comprobantes', icon: '📄' },
        { path: '/cliente/mis-reportes', label: 'Reportes Mensuales', icon: '📊' },
        { path: '/cliente/perfil', label: 'Configuración Perfil', icon: '⚙️' },
    ];

    return (
        <>
            <div 
                className={`${styles.overlay} ${isOpen ? styles.showOverlay : ''}`} 
                onClick={onClose} 
            />

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.brandTitle}>
                        <span className={styles.dot}></span>
                        <h3>MENÚ CLIENTE</h3>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">✕</button>
                </div>

                <nav className={styles.nav}>
                    {opciones.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path} 
                                className={`${styles.navLink} ${isActive ? styles.activeLink : ''}`}
                                onClick={onClose}
                            >
                                <div className={styles.iconWrapper}>
                                    {item.icon}
                                </div>
                                <span className={styles.navLabel}>{item.label}</span>
                                {isActive && <div className={styles.activeIndicator} />}
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.supportCard}>
                        <p className={styles.footerBrand}>Agro Conecta</p>
                        <p className={styles.footerAgency}>por Developer Ideas</p>
                        <div className={styles.versionTag}>v2026.1</div>
                    </div>
                </div>
            </aside>
        </>
    );
}