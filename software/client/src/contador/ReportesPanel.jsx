import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../redux/axios_auth.js';
import styles from './ReportesPanel.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { resumenescontadordata } from '../redux/contador/resumenescontadordata.js';
import { resumenescontadorConstants } from '../uri/contador/resumenescontador-constants.js';

export default function ReportesPanel() {

    const dispatch = useDispatch()
    const navigate = useNavigate();

    const [stats, setStats] = useState({ ingresos: 0, gastos: 0 });

    const {get_reportes_resumen} = useSelector(({resumenescontador_data}) => resumenescontador_data)

    useEffect(() => {
        loadData ()
    }, [dispatch]);

    const loadData = () => {
        dispatch (resumenescontadordata(resumenescontadorConstants('0', {}, false).get_reportes_resumen))
    }

    useEffect(() => {
        if (get_reportes_resumen?.resumen){
            setStats(get_reportes_resumen.resumen)
        }
    }, [get_reportes_resumen])

    const opciones = [
        { id: 1, titulo: 'Balance de Comprobación', desc: 'Saldos de todas las cuentas (Hoja de Trabajo).', ruta: '/contador/reportes/balance', icon: '⚖️' },
        { id: 2, titulo: 'Estado de Resultados', desc: 'Ganancias y pérdidas por naturaleza/función.', ruta: '/contador/reportes/ganancias', icon: '📊' },
        { id: 3, titulo: 'Libro Diario (PLE)', desc: 'Exportar formato para SUNAT.', ruta: '/contador/reportes/ple-diario', icon: '📂' },
        { id: 4, titulo: 'Libro Mayor', desc: 'Movimientos detallados por cuenta.', ruta: '/contador/reportes/libro-mayor', icon: '📖' }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Centro de Reportes Contables</h2>
                <p>Genera y exporta la información financiera de la empresa.</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <label>Ingresos del Mes</label>
                    <h3>S/ {Number(stats.ingresos || 0).toFixed(2)}</h3>
                </div>
                <div className={styles.statCard}>
                    <label>Gastos del Mes</label>
                    <h3 className={styles.expenseText}>S/ {Number(stats.gastos || 0).toFixed(2)}</h3>
                </div>
            </div>

            <div className={styles.menuGrid}>
                {opciones.map(opt => (
                    <div key={opt.id} className={styles.reportCard} onClick={() => navigate(opt.ruta)}>
                        <div className={styles.icon}>{opt.icon}</div>
                        <div className={styles.info}>
                            <h4>{opt.titulo}</h4>
                            <p>{opt.desc}</p>
                        </div>
                        <span className={styles.arrow}>→</span>
                    </div>
                ))}
            </div>
        </div>
    );
}