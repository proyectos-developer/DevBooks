import React, { useState, useEffect } from 'react';
import api from '../redux/axios_auth.js';
import styles from './RegistroVentasSIRE.module.css';
import { constantes } from '../uri/constantes.js';
import { sirecontadordata } from '../redux/contador/sirecontadordata.js'
import { sirecontadorConstants } from '../uri/contador/sirecontador-constants.js'
import { useDispatch, useSelector } from 'react-redux';

export default function RegistroVentasSIRE() {
    const dispatch = useDispatch();
    
    const [periodos, setPeriodos] = useState([]);
    const [idPeriodo, setIdPeriodo] = useState('');
    const [comparativa, setComparativa] = useState({ propuesta: [], local: [] });
    const [loading, setLoading] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const { get_sire_ventas_comparar } = useSelector(({ sirecontador_data }) => sirecontador_data);

    useEffect(() => {
        const fetchPeriodos = async () => {
            try {
                const res = await api.get(`${constantes().url_principal[0].url}/api/contador/periodos-abiertos`);
                if (res.data.success) setPeriodos(res.data.periodos);
            } catch (err) {
                console.error("Error al cargar periodos", err);
            }
        };
        fetchPeriodos();
    }, []);

    const handlePeriodoChange = (e) => {
        const val = e.target.value;
        setIdPeriodo(val);
        if (!val) {
            setComparativa({ propuesta: [], local: [] });
            return;
        }
        setLoading(true);
        dispatch(sirecontadordata(sirecontadorConstants(val, {}, false).get_sire_ventas_comparar));
    };

    useEffect(() => {
        if (get_sire_ventas_comparar?.success) {
            setComparativa({
                propuesta: get_sire_ventas_comparar.propuesta || [],
                local: get_sire_ventas_comparar.local || []
            });
            setLoading(false);
        }
    }, [get_sire_ventas_comparar]);

    const triggerConfirm = () => setShowConfirmModal(true);

    const handleAceptarPropuesta = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        try {
            const res = await api.post(`${constantes().url_principal[0].url}/api/contador/sire-ventas-aceptar`, {
                id_periodo: idPeriodo,
                detalles: comparativa.propuesta
            });

            if (res.data.success) {
                setModalMessage("¡Éxito! La propuesta ha sido aceptada y los asientos contables han sido bloqueados correctamente.");
                setShowSuccessModal(true);
            } else {
                alert("Error: " + (res.data.message || "No se pudo procesar"));
            }
        } catch (err) { 
            console.error("Error al aceptar propuesta", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* MODAL DE CONFIRMACIÓN */}
            {showConfirmModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalIconWarning}>⚠️</div>
                        <h3>Confirmar Aceptación</h3>
                        <p>¿Está seguro de aceptar la propuesta de SUNAT? Esta acción bloqueará los asientos de ventas del periodo seleccionado.</p>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowConfirmModal(false)}>Cancelar</button>
                            <button className={styles.confirmBtn} onClick={handleAceptarPropuesta}>Sí, Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE ÉXITO */}
            {showSuccessModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalIconSuccess}>✅</div>
                        <h3>Proceso Completado</h3>
                        <p>{modalMessage}</p>
                        <div className={styles.modalActions}>
                            <button className={styles.confirmBtn} onClick={() => setShowSuccessModal(false)}>Entendido</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h2>Módulo SIRE - Registro de Ventas</h2>
                    <p className={styles.subtitle}>Comparación de propuesta SUNAT vs. Contabilidad Local</p>
                </div>

                <div className={styles.selectorContainer}>
                    <label className={styles.label}>Periodo Fiscal</label>
                    <div className={`${styles.selectWrapper} ${idPeriodo ? styles.active : ''}`}>
                        <span className={styles.icon}>📅</span>
                        <select 
                            className={styles.selectPeriodo} 
                            value={idPeriodo} 
                            onChange={handlePeriodoChange}
                        >
                            <option value="" disabled>Seleccione el mes de auditoría</option>
                            {periodos.map(p => (
                                <option key={p.id} value={p.id}>
                                    {new Date(2000, p.mes - 1).toLocaleString('es-ES', { month: 'long' }).toUpperCase()} {p.anio}
                                </option>
                            ))}
                        </select>
                        <span className={styles.arrow}>▾</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.importBtn}>Importar TXT SUNAT</button>
                    <button 
                        className={styles.acceptBtn} 
                        disabled={!idPeriodo || loading} 
                        onClick={triggerConfirm}
                    >
                        {loading ? 'Procesando...' : 'Aceptar Propuesta'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={styles.loader}>Cruzando información con SUNAT...</div>
            ) : !idPeriodo ? (
                <div className={styles.emptyState}>Seleccione un periodo para iniciar la auditoría SIRE.</div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Comprobante</th>
                                <th>Fecha Emisión</th>
                                <th>Monto SUNAT</th>
                                <th>Monto Local</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparativa.propuesta.length > 0 ? (
                                comparativa.propuesta.map((item, index) => {
                                    const existeLocal = comparativa.local.find(l => 
                                        l.numero_comprobante === item.numero && 
                                        l.serie_comprobante === item.serie
                                    );

                                    return (
                                        <tr key={index} className={!existeLocal ? styles.missingRow : ''}>
                                            <td>{item.serie}-{item.numero}</td>
                                            <td>{new Date(item.fecha_emision).toLocaleDateString()}</td>
                                            <td className={styles.amount}>S/ {Number(item.monto_total).toFixed(2)}</td>
                                            <td className={styles.amount}>
                                                {existeLocal ? `S/ ${Number(existeLocal.haber).toFixed(2)}` : 'NO REGISTRADO'}
                                            </td>
                                            <td className={styles.statusCell}>
                                                {existeLocal ? (
                                                    <span className={styles.badgeOk}>✅ Coincide</span>
                                                ) : (
                                                    <span className={styles.badgeError}>⚠️ Pendiente</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                        No se encontró propuesta de SUNAT para este periodo.
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