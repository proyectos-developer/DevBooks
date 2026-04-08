import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';

export default function Sidebar ({ isOpen, onClose }){
    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: '🏠' },
        { path: '/admin/empresas', label: 'Empresas', icon: '🏢' },
        { path: '/admin/reportes-globales', label: 'Reportes', icon: '📊' },
        { path: '/admin/usuarios', label: 'Usuarios', icon: '👥' },
        { path: '/admin/ajustes', label: 'Configuración', icon: '⚙️' },
    ];

    return (
        <>
            <div className={`${styles.overlay} ${isOpen ? styles.active : ''}`} onClick={onClose} />
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.menuTitle}>Navegación</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
                <nav className={styles.nav}>
                    {menuItems.map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            className={styles.navLink} 
                            onClick={onClose}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            <span className={styles.label}>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className={styles.sidebarFooter}>
                    <p>v1.0.0 - Developer Ideas</p>
                </div>
            </aside>
        </>
    );
};