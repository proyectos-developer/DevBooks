import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './DetalleReporteEmpresa.module.css';
import { reportesadmindata } from '../redux/admin/reportesadmindata.js';
import {reportesadminConstants} from '../uri/admin/reportesadmin-constants.js'
import { useDispatch, useSelector } from 'react-redux';

export default function DetalleReporteEmpresa() {

    const { id } = useParams();

    const dispatch = useDispatch()
    const navigate = useNavigate();

    const [reporte, setReporte] = useState([]);

    const {get_reporte_detalle} = useSelector(({reportesadmin_data}) => reportesadmin_data)

    useEffect(() => {
        loadData()
    }, [dispatch, id])

    const loadData = () => {
        dispatch (reportesadmindata(reportesadminConstants(id, '0', false).get_reporte_detalle))
    }

    useEffect(() => {
        console.log (get_reporte_detalle)
        if (get_reporte_detalle?.detalles){
            setReporte (get_reporte_detalle.detalles)
        }
    }, [get_reporte_detalle])

    return (
        <div className={styles.container}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
                ← Volver a Global
            </button>
            
            <div className={styles.header}>
                <h1>Análisis Detallado de Empresa</h1>
                <span>ID de Registro: {id}</span>
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Periodo</th>
                            <th>Total Debe (S/.)</th>
                            <th>Total Haber (S/.)</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reporte.map((reg, i) => (
                            <tr key={i}>
                                <td>{reg.mes}/{reg.anio}</td>
                                <td>{reg.total_debe.toLocaleString()}</td>
                                <td>{reg.total_haber.toLocaleString()}</td>
                                <td className={reg.total_debe > reg.total_haber ? styles.positive : styles.negative}>
                                    {(reg.total_debe - reg.total_haber).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}