import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './PanelReportesFinancieros.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { reportesadmindata } from '../redux/admin/reportesadmindata.js';
import { reportesadminConstants } from '../uri/admin/reportesadmin-constants.js';
import { useNavigate } from 'react-router-dom';

export default function PanelReportesFinancieros (){
    
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const {get_reportes_globales} = useSelector(({reportesadmin_data}) => reportesadmin_data)

    useEffect(() => {
        loadData()
    }, [dispatch])

    const loadData = () => {
        dispatch (reportesadmindata(reportesadminConstants('0', {}, false).get_reportes_globales))
    }

    useEffect(() => {
        console.log (get_reportes_globales)
        if (get_reportes_globales?.reporte){
            setData(get_reportes_globales.reporte)
            setLoading(false)
        }
    }, [get_reportes_globales])

    if (loading) return <div className={styles.loader}>Generando consolidado...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Reportes Globales</h1>
                <p className={styles.subtitle}>Estado financiero consolidado de todos los tenants</p>
            </header>

            <div className={styles.grid}>
                {data?.length > 0 && data.map((item, index) => (
                    <div key={index} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3>{item.razon_social}</h3>
                            <span className={styles.badge}>{item.total_asientos} Asientos</span>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.metric}>
                                <span>Total Movimientos (S/.)</span>
                                <strong>{parseFloat(item.total_debe || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                            </div>
                        </div>
                        <div className={styles.cardFooter}>
                            <button className={styles.detailBtn}
                                onClick={() => navigate (`/admin/reportes/detalle/${item.id}`)}>Ver Detalle</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};