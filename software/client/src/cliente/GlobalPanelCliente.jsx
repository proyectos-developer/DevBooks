import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import HeaderCliente from './HeaderCliente.jsx';
import SidebarCliente from './SidebarCliente.jsx';
import styles from './GlobalPanelCliente.module.css'; 

export default function GlobalPanelCliente() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div className={styles.layout}>
            {/* Header con el botón de hamburguesa */}
            <HeaderCliente onMenuClick={toggleMenu} />
            
            {/* Sidebar que inicia oculto al 100% (left: -100%) */}
            <SidebarCliente isOpen={isMenuOpen} onClose={closeMenu} />
            
            <main className={styles.content}>
                <div className={styles.innerContainer}>
                    {/* Aquí se renderizan HomeCliente, MisComprobantes, etc. */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
}