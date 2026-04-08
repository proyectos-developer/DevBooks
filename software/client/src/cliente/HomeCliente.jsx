import React, { useState, useEffect } from 'react';
import { constantes } from '../uri/constantes.js';
import styles from './HomeCliente.module.css';
import { Link } from 'react-router-dom';
import { resumenesclientedata } from '../redux/cliente/resumenesclientedata.js';
import { resumenesclienteConstants } from '../uri/cliente/resumenescliente-constants.js';
import { useDispatch, useSelector } from 'react-redux';

export default function HomeCliente() {

    const dispatch = useDispatch();
    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const { get_resumenes } = useSelector(({ resumenescliente_data }) => resumenescliente_data);

    useEffect(() => {
      loadData()
    }, [dispatch]);

    const loadData = () => {
        dispatch(resumenesclientedata(resumenesclienteConstants('0', {}, false).get_resumenes));
    }

    useEffect(() => {
        if (get_resumenes?.success) {
            setStats(get_resumenes);
            setLoading(false);
        } else if (get_resumenes?.success === false) {
            setLoading(false);
        }
    }, [get_resumenes]);

    if (loading) return <div className={styles.loader}>Cargando tu tablero...</div>;
    
    if (!stats || stats.noData) {
        return (
            <div className={styles.emptyContainer}>
                <div className={styles.emptyIcon}>📂</div>
                <div className={styles.empty}>Aún no hay periodos contables registrados para tu empresa.</div>
                <p>Contacta con tu contador para habilitar el periodo actual.</p>
            </div>
        );
    }

    const mesNombre = (mes) => new Date(2000, mes - 1).toLocaleString('es-ES', { month: 'long' }).toUpperCase();

    return (
        <div className={styles.container}>
            <header className={styles.welcome}>
                <h1>Bienvenido, {stats.empresa.razon_social}</h1>
                <p>Resumen del periodo: <strong>{mesNombre(stats.periodo.mes)} {stats.periodo.anio}</strong></p>
            </header>

            <div className={styles.grid}>
                {/* Card de Ventas */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.icon}>💰</span>
                        <h3>Ventas del Mes</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.mainStat}>
                            S/ {Number(stats.ventas.monto_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p>{stats.ventas.total_docs} Comprobantes en SUNAT</p>
                        <div className={styles.progressLabel}>
                            Conciliado: {stats.ventas.docs_locales} de {stats.ventas.total_docs}
                        </div>
                    </div>
                    <Link to="/cliente/mis-facturas" className={styles.cardAction}>Ver mis facturas →</Link>
                </div>

                {/* Card de Compras */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.icon}>🛒</span>
                        <h3>Compras / Gastos</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.mainStat}>
                            S/ {Number(stats.compras.monto_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p>{stats.compras.total_docs} Facturas recibidas</p>
                        <span className={styles.badge}>Crédito Fiscal Detectado</span>
                    </div>
                    <Link to="/cliente/mis-reportes" className={styles.cardAction}>Ver reportes →</Link>
                </div>

                {/* Card de Estado SUNAT */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.icon}>🏛️</span>
                        <h3>Estado SUNAT</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div 
                            className={styles.statusBadge} 
                            style={{ 
                                backgroundColor: stats.empresa.estado_sunat === 'ACTIVO' ? '#dcfce7' : '#fee2e2',
                                color: stats.empresa.estado_sunat === 'ACTIVO' ? '#166534' : '#991b1b'
                            }}
                        >
                            {stats.empresa.estado_sunat || 'ACTIVO'}
                        </div>
                        <p className={styles.rucText}>RUC: {stats.empresa.ruc}</p>
                        <p className={styles.sireStatus}>
                            SIRE: {stats.periodo.estado_sire === 'ACEPTADO' ? '✅ Declarado' : '⏳ Pendiente'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}