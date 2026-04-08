import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import HeaderContador from './HeaderContador.jsx';
import SidebarContador from './SidebarContador.jsx';
import styles from './GlobalPanelAdmin.module.css'; 

export default function GlobalPanelContador() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className={styles.layout}>
            <HeaderContador onMenuClick={() => setIsMenuOpen(true)} />
            <SidebarContador isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            
            <main className={styles.content}>
                <div className={styles.innerContainer}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}