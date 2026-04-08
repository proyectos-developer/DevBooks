import React, { useState, useEffect } from 'react';
import api from '../redux/axios_auth.js';
import { constantes } from '../uri/constantes.js';
import styles from './DescargarReportes.module.css';
import {reportesclientedata} from '../redux/cliente/reportesclientedata.js'
import {reportesclienteConstants} from '../uri/cliente/reportescliente-constants.js'
import { useDispatch, useSelector } from 'react-redux';

export default function DescargarReportes() {

    const dispatch = useDispatch()

    const [periodos, setPeriodos] = useState([]);
    const [idPeriodo, setIdPeriodo] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const {get_mis_reportes} = useSelector(({reportescliente_data}) => reportescliente_data)

    useEffect(() => {
        const fetchInitial = async () => {
            const res = await api.get(`${constantes().url_principal[0].url}/api/cliente/periodos-cliente`);
            if (res.data.success && res.data.periodos.length > 0) {
                setPeriodos(res.data.periodos);
                setIdPeriodo(res.data.periodos[0].id.toString());
            }
        };
        fetchInitial();
    }, []);

    useEffect(() => {
        if (idPeriodo) fetchReporte(idPeriodo);
    }, [idPeriodo]);

    const fetchReporte = (id) => {
      dispatch (reportesclientedata(reportesclienteConstants(id, {}, false).get_mis_reportes))
    };

    useEffect(() => {
        if (get_mis_reportes?.reporte){
            setData(get_mis_reportes.reporte)
            setLoading(false)
        }
    }, [get_mis_reportes])

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Reportes Mensuales</h2>
                <select value={idPeriodo} onChange={(e) => setIdPeriodo(e.target.value)} className={styles.select}>
                    {periodos.map(p => (
                        <option key={p.id} value={p.id}>{p.mes}/{p.anio}</option>
                    ))}
                </select>
            </div>

            {loading ? <p>Generando resumen...</p> : data && (
                <div className={styles.reportGrid}>
                    <div className={styles.mainCard}>
                        <h3>Resumen Ejecutivo</h3>
                        <div className={styles.statRow}>
                            <span>Ventas Totales (Neto)</span>
                            <strong>S/ {Number(data.ventas.base).toFixed(2)}</strong>
                        </div>
                        <div className={styles.statRow}>
                            <span>Compras Totales (Neto)</span>
                            <strong>S/ {Number(data.compras.base).toFixed(2)}</strong>
                        </div>
                        <hr />
                        <div className={styles.statRowTotal}>
                            <span>IGV a Pagar Estimado</span>
                            <strong style={{color: data.impuesto_estimado > 0 ? '#ef4444' : '#10b981'}}>
                                S/ {Number(data.impuesto_estimado).toFixed(2)}
                            </strong>
                        </div>
                    </div>

                    <div className={styles.downloadSection}>
                        <h3>Documentos Disponibles</h3>
                        <button className={styles.downloadBtn}>📥 Descargar Registro de Ventas (Excel)</button>
                        <button className={styles.downloadBtn}>📥 Descargar Registro de Compras (Excel)</button>
                        <button className={styles.downloadBtn}>📄 Constancia de Recepción SIRE (PDF)</button>
                    </div>
                </div>
            )}
        </div>
    );
}