import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../redux/axios_auth.js';
import { constantes } from '../uri/constantes.js';
import styles from './MisComprobantes.module.css';

export default function MisComprobantes() {

    const location = useLocation();
    
    const queryParams = new URLSearchParams(location.search);
    const periodoIdDesdeHome = queryParams.get('periodo');

    const [periodos, setPeriodos] = useState([]);
    const [idPeriodo, setIdPeriodo] = useState(periodoIdDesdeHome || '');
    const [comprobantes, setComprobantes] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Cargar lista de periodos para el selector
    useEffect(() => {
        const fetchPeriodos = async () => {
            try {
                const res = await api.get(`${constantes().url_principal[0].url}/api/cliente/periodos-cliente`);
                if (res.data.success) {
                    setPeriodos(res.data.periodos);
                    // Si no venimos del home, seleccionamos el más reciente por defecto
                    if (!idPeriodo && res.data.periodos.length > 0) {
                        setIdPeriodo(res.data.periodos[0].id.toString());
                    }
                }
            } catch (err) {
                console.error("Error al cargar periodos", err);
            }
        };
        fetchPeriodos();
    }, []);

    // 2. Cargar comprobantes cuando cambie el periodo seleccionado
    useEffect(() => {
        if (idPeriodo) {
            fetchComprobantes(idPeriodo);
        }
    }, [idPeriodo]);

    const fetchComprobantes = async (id) => {
        setLoading(true);
        try {
            const res = await api.get(`${constantes().url_principal[0].url}/api/cliente/mis-comprobantes/${id}`);
            if (res.data.success) {
                setComprobantes(res.data.comprobantes);
            }
        } catch (err) {
            console.error("Error al cargar facturas", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodoChange = (e) => {
        setIdPeriodo(e.target.value);
    };

    const mesNombre = (mes) => new Date(2000, mes - 1).toLocaleString('es-ES', { month: 'long' }).toUpperCase();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h2>Mis Comprobantes de Venta</h2>
                    <p>Consulta el detalle de tus facturas enviadas a SUNAT.</p>
                </div>

                <div className={styles.filterSection}>
                    <label className={styles.label}>Filtrar por Periodo:</label>
                    <div className={styles.selectWrapper}>
                        <select 
                            value={idPeriodo} 
                            onChange={handlePeriodoChange} 
                            className={styles.select}
                        >
                            <option value="" disabled>Seleccione un mes</option>
                            {periodos.map(p => (
                                <option key={p.id} value={p.id}>
                                    {mesNombre(p.mes)} {p.anio}
                                </option>
                            ))}
                        </select>
                        <span className={styles.arrow}>▾</span>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className={styles.loaderContainer}>
                    <div className={styles.spinner}></div>
                    <p>Obteniendo registros de SUNAT...</p>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Fecha Emisión</th>
                                <th>Serie - Número</th>
                                <th className={styles.textRight}>Base Imponible</th>
                                <th className={styles.textRight}>IGV (18%)</th>
                                <th className={styles.textRight}>Importe Total</th>
                                <th className={styles.textCenter}>Estado SIRE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comprobantes.length > 0 ? (
                                comprobantes.map((c, i) => (
                                    <tr key={i} className={styles.row}>
                                        <td>{new Date(c.fecha_emision).toLocaleDateString('es-PE')}</td>
                                        <td className={styles.docNum}>{c.serie}-{c.numero}</td>
                                        <td className={styles.textRight}>S/ {Number(c.monto_base).toFixed(2)}</td>
                                        <td className={styles.textRight}>S/ {Number(c.monto_igv).toFixed(2)}</td>
                                        <td className={`${styles.textRight} ${styles.totalText}`}>
                                            S/ {Number(c.monto_total).toFixed(2)}
                                        </td>
                                        <td className={styles.textCenter}>
                                            <span className={`${styles.badge} ${styles[c.estado_sire?.toLowerCase()]}`}>
                                                {c.estado_sire || 'PENDIENTE'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className={styles.emptyState}>
                                        No se encontraron registros para el periodo seleccionado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}