import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../redux/axios_auth.js';
import styles from './HomeContador.module.css';
import {resumenescontadordata} from '../redux/contador/resumenescontadordata.js'
import {resumenescontadorConstants} from '../uri/contador/resumenescontador-constants.js'
import { useDispatch, useSelector } from 'react-redux';

export default function HomeContador() {

    const dispatch = useDispatch()
    const navigate = useNavigate();
  
    const [periodo, setPeriodo] = useState(null);
    const [stats, setStats] = useState(null);
    const [ultimos_asientos, setUltimosAsientos] = useState(null);
    const [loading, setLoading] = useState(true);

    const {get_resumenes} = useSelector(({resumenescontador_data}) => resumenescontador_data)

    useEffect(() => {
      loadData()
    }, [dispatch])

    const loadData = () => {
      dispatch (resumenescontadordata(resumenescontadorConstants('0', {}, false).get_resumenes))
    }

    useEffect(() => {
      if (get_resumenes?.periodo && get_resumenes?.stats){
        setPeriodo(get_resumenes.periodo)
        setStats(get_resumenes.stats)
        setUltimosAsientos(get_resumenes?.ultimos_asientos)
        setLoading(false)
      }
    }, [get_resumenes])

    if (loading) return <div className={styles.loader}>Cargando entorno contable...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.welcome}>
                <h2>Panel de Control Mensual</h2>
                <span className={styles.periodBadge}>
                    Periodo: {periodo ? `${periodo.mes}-${periodo.anio}` : 'Sin periodo abierto'}
                </span>
            </header>

            {/* TARJETAS DE MÉTRICAS */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>📝</span>
                    <div className={styles.statInfo}>
                        <p>Asientos del Mes</p>
                        <h3>{stats?.total_asientos || 0}</h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <span className={`${styles.statIcon} ${styles.greenIcon}`}>💰</span>
                    <div className={styles.statInfo}>
                        <p>Total Debe (S/.)</p>
                        <h3>{Number(stats?.suma_debe).toLocaleString('es-PE')}</h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <span className={`${styles.statIcon} ${styles.blueIcon}`}>⚖️</span>
                    <div className={styles.statInfo}>
                        <p>Total Haber (S/.)</p>
                        <h3>{Number(stats?.suma_haber).toLocaleString('es-PE')}</h3>
                    </div>
                </div>
            </div>

            <div className={styles.mainGrid}>
                {/* ÚLTIMOS MOVIMIENTOS */}
                <section className={styles.recentSection}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.titleGroup}>
                            <div className={styles.iconCircle}>
                                <span className={styles.headerIcon}>📑</span>
                            </div>
                            <div className={styles.textGroup}>
                                <h3>Últimos Asientos</h3>
                                <p className={styles.sectionSubtitle}>Actividad reciente del libro diario</p>
                            </div>
                        </div>
                        <button 
                            className={styles.viewAllBtn} 
                            onClick={() => navigate('/contador/asientos')}
                        >
                            Ver todos 
                            <span className={styles.arrowIcon}>→</span>
                        </button>
                    </div>
                    <div className={styles.list}>
                        {ultimos_asientos.map(asiento => (
                            <div key={asiento.id} className={styles.listItem}>
                                <div className={styles.itemDate}>
                                    {new Date(asiento.fecha_asiento).toLocaleDateString()}
                                </div>
                                <div className={styles.itemInfo}>
                                    <strong>{asiento.glosa}</strong>
                                    <span>Libro: {asiento.tipo_libro}</span>
                                </div>
                                <div className={styles.itemAction}
                                    onClick={() => navigate (`/contador/asientos/detalle/${asiento.id}`)}>→</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ACCESOS RÁPIDOS */}
                <section className={styles.actionsSection}>
                    <h3>Acciones Rápidas</h3>
                    <div className={styles.actionButtons}>
                        <button onClick={() => navigate('/contador/asientos/nuevo')} className={styles.primaryAction}>
                            + Registrar Nuevo Asiento
                        </button>
                        <button onClick={() => navigate('/contador/plan-cuentas')}>
                            📖 Consultar Plan Contable
                        </button>
                        <button onClick={() => navigate('/contador/reportes/balance')}>
                            📊 Generar Balance
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}