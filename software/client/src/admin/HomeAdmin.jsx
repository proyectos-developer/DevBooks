import React, { useEffect, useState } from 'react';
import styles from './HomeAdmin.module.css';
import {resumenesadmindata} from '../redux/admin/resumenesadmindata.js'
import {resumenesadminConstants} from '../uri/admin/resumenesadmin-constants.js'
import { useDispatch, useSelector } from 'react-redux';

export default function HomeAdmin(){

  const dispatch = useDispatch()

    const [stats, setStats] = useState({})
    const [ultimasEmpresas, setUltimasEmpresas] = useState([])
    const [asientosRecientes, setAsientosRecientes] = useState([])
    const [loading, setLoading] = useState(true);

    const {get_resumenes} = useSelector(({resumenesadmin_data}) => resumenesadmin_data)

    useEffect(() => {
      loadData()
    }, [dispatch]);

    const loadData = () => {
      dispatch (resumenesadmindata(resumenesadminConstants('0', {}, false).get_resumenes))
    }

    useEffect(() => {
      if (get_resumenes?.stats){
        setStats(get_resumenes.stats)
        setUltimasEmpresas(get_resumenes?.ultimasEmpresas)
        setAsientosRecientes(get_resumenes?.asientosRecientes)
        setLoading(false)
      }
    }, [get_resumenes])

    if (loading) return <div className={styles.loader}>Cargando panel de control...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.welcome}>
                <h1>Bienvenido al Centro de Control</h1>
                <p>Monitoreo global de Developer Ideas Software Contable</p>
            </header>

            {/* TARJETAS DE MÉTRICAS */}
            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.icon}>🏢</span>
                    <div className={styles.statInfo}>
                        <h3>{stats?.totalEmpresas}</h3>
                        <p>Empresas Registradas</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.icon}>👥</span>
                    <div className={styles.statInfo}>
                        <h3>{stats?.totalUsuarios}</h3>
                        <p>Usuarios Totales</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.icon}>✅</span>
                    <div className={styles.statInfo}>
                        <h3>{stats?.tasaActividad}%</h3>
                        <p>Usuarios Activos</p>
                    </div>
                </div>
            </section>

            <div className={styles.contentGrid}>
                {/* ÚLTIMAS EMPRESAS */}
                <div className={styles.tableCard}>
                    <h3>Nuevas Empresas</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>RUC</th>
                                <th>Razón Social</th>
                                <th>Registro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ultimasEmpresas?.length > 0 && ultimasEmpresas?.map((emp, i) => (
                                <tr key={i}>
                                    <td>{emp.ruc}</td>
                                    <td>{emp.razon_social}</td>
                                    <td>{new Date(emp.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ACTIVIDAD RECIENTE */}
                <div className={styles.tableCard}>
                    <h3>Actividad Contable (Global)</h3>
                    <div className={styles.activityList}>
                        {asientosRecientes?.length > 0 && asientosRecientes?.map((asiento, i) => (
                            <div key={i} className={styles.activityItem}>
                                <div className={styles.activityDot}></div>
                                <div className={styles.activityText}>
                                    <strong>{asiento.razon_social}</strong>
                                    <p>{asiento.glosa}</p>
                                    <span>{new Date(asiento.fecha_asiento).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};