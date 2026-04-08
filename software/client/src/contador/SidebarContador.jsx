import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

export default function SidebarContador({ isOpen, onClose }) {
    const location = useLocation();

    // Estructura de menú organizada por categorías técnicas
    const secciones = [
        {
            titulo: 'Operaciones',
            items: [
                { path: '/contador', label: 'Inicio / Dashboard', icon: '🏠' },
                { path: '/contador/asientos', label: 'Libro Diario', icon: '📝' },
                { path: '/contador/bancos', label: 'Bancos / Conciliación', icon: '🏦' },
            ]
        },
        {
            titulo: 'Maestros y Control',
            items: [
                { path: '/contador/plan-cuentas', label: 'Plan de Cuentas', icon: '📖' },
                { path: '/contador/entidades', label: 'Clientes / Prov.', icon: '🤝' },
                { path: '/contador/periodos', label: 'Gestión de Meses', icon: '📅' },
            ]
        },
        {
            titulo: 'Cumplimiento SUNAT',
            items: [
                { path: '/contador/reportes', label: 'Mis Reportes', icon: '📈' },
                { path: '/contador/sire-ventas', label: 'SIRE Ventas', icon: '⚡' },
                { path: '/contador/sire-compras', label: 'SIRE Compras', icon: '📥' },
            ]
        }
    ];

    return (
        <>
            {/* Overlay con blur para cerrar en móvil */}
            <div 
                className={`${styles.overlay} ${isOpen ? styles.active : ''}`} 
                onClick={onClose} 
            />

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.brandBadge}>
                        <div className={styles.brandIcon}>A</div>
                        <div className={styles.brandText}>
                            <span className={styles.brandTitle}>Agro Conecta</span>
                            <span className={styles.brandStatus}>Módulo Contable</span>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar menú">✕</button>
                </div>

                <nav className={styles.nav}>
                    {secciones.map((seccion, idx) => (
                        <div key={idx} className={styles.navSection}>
                            <div className={styles.menuSectionTitle}>{seccion.titulo}</div>
                            {seccion.items.map((item) => {
                                // Lógica de active: coincide exacto o es subruta (ej: /asientos/detalle)
                                const isActive = location.pathname === item.path || 
                                               (item.path !== '/contador' && location.pathname.startsWith(item.path));
                                
                                return (
                                    <Link 
                                        key={item.path} 
                                        to={item.path} 
                                        className={`${styles.navLink} ${isActive ? styles.activeLink : ''}`} 
                                        onClick={onClose}
                                    >
                                        <span className={styles.iconWrapper}>{item.icon}</span>
                                        <span className={styles.label}>{item.label}</span>
                                        {isActive && <div className={styles.activeIndicator} />}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.footerInfo}>
                        <p className={styles.version}>v2.5.0</p>
                        <p className={styles.agency}>Developer Ideas E.I.R.L.</p>
                    </div>
                </div>
            </aside>
        </>
    );
}