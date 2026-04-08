import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import styles from './GlobalPanelAdmin.module.css';

export default function GlobalPanelAdmin (){
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className={styles.layout}>
            <Header onMenuClick={() => setIsMenuOpen(true)} />
            <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            
            <main className={styles.content}>
                <div className={styles.innerContainer}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};