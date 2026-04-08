import React, { useState, useEffect } from 'react';
import api from '../redux/axios_auth.js';
import styles from './RegistroComprasSIRE.module.css';
import { constantes } from '../uri/constantes.js';
import { sirecontadordata } from '../redux/contador/sirecontadordata.js'
import { sirecontadorConstants } from '../uri/contador/sirecontador-constants.js'
import { useDispatch, useSelector } from 'react-redux';

export default function RegistroComprasSIRE() {

    const dispatch = useDispatch();

    const [periodos, setPeriodos] = useState([]);
    const [idPeriodo, setIdPeriodo] = useState('');
    const [data, setData] = useState({ propuesta: [], local: [] });
    const [loading, setLoading] = useState(false);
    
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const { get_sire_compras_comparar } = useSelector(({ sirecontador_data }) => sirecontador_data);

    useEffect(() => {
        const loadPeriodos = async () => {
            try {
                const res = await api.get(`${constantes().url_principal[0].url}/api/contador/periodos-abiertos`);
                if (res.data.success) setPeriodos(res.data.periodos);
            } catch (err) {
                console.error("Error al cargar periodos", err);
            }
        };
        loadPeriodos();
    }, []);

    const handleSelectPeriodo = (id) => {
        setIdPeriodo(id);
        if (!id) {
            setData({ propuesta: [], local: [] });
            return;
        }

        setLoading(true);
        dispatch(sirecontadordata(sirecontadorConstants(id, {}, false).get_sire_compras_comparar));
    };
    
    // Sincronizar con Redux cuando llega la data del router.get
    useEffect(() => {
        if (get_sire_compras_comparar?.success) {
            setData({
                propuesta: get_sire_compras_comparar.propuesta || [],
                local: get_sire_compras_comparar.local || []
            });
            setLoading(false);
        }
    }, [get_sire_compras_comparar]);

    const handleAceptarPropuesta = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        try {
            const res = await api.post(`${constantes().url_principal[0].url}/api/contador/sire-compras-aceptar`, {
                id_periodo: idPeriodo
            });

            if (res.data.success) {
                setShowSuccessModal(true);
            } else {
                alert("Error al aceptar la propuesta");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* MODALES */}
            {showConfirmModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalIconWarning}>⚠️</div>
                        <h3>Confirmar Compras SIRE</h3>
                        <p>¿Desea aceptar la propuesta de crédito fiscal de SUNAT? Esto bloqueará los asientos de compras.</p>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowConfirmModal(false)}>Cancelar</button>
                            <button className={styles.confirmBtn} onClick={handleAceptarPropuesta}>Aceptar</button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalIconSuccess}>✅</div>
                        <h3>Proceso Exitoso</h3>
                        <p>La propuesta de compras ha sido conciliada correctamente.</p>
                        <div className={styles.modalActions}>
                            <button className={styles.confirmBtn} onClick={() => setShowSuccessModal(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h2>SIRE - Registro de Compras</h2>
                    <p className={styles.subtitle}>Auditoría de Crédito Fiscal vs Propuesta SUNAT</p>
                </div>
                
                <div className={styles.selectorContainer}>
                    <label className={styles.label}>Periodo Contable</label>
                    <div className={`${styles.selectWrapper} ${idPeriodo ? styles.active : ''}`}>
                        <span className={styles.icon}>📅</span>
                        <select 
                            value={idPeriodo}
                            onChange={(e) => handleSelectPeriodo(e.target.value)} 
                            className={styles.selectPeriodo}
                        >
                            <option value="" disabled>Seleccione el mes de auditoría</option>
                            {periodos.map(p => (
                                <option key={p.id} value={p.id}>
                                    {new Date(2000, p.mes - 1).toLocaleString('es-ES', { month: 'long' }).toUpperCase()} {p.anio}
                                </option>
                            ))}
                        </select>
                        <span className={styles.arrow}></span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button 
                        className={`${styles.acceptBtn} ${loading ? styles.btnLoading : ''}`} 
                        disabled={!idPeriodo || loading}
                        onClick={() => setShowConfirmModal(true)}
                    >
                        {loading ? (
                            <div className={styles.spinnerContainer}>
                                <span className={styles.spinner}></span>
                                <span>Procesando...</span>
                            </div>
                        ) : (
                            <>
                                <span className={styles.btnIcon}>Check</span> 
                                <span>Aceptar Propuesta SIRE</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={styles.loader}>Cruzando información de facturas...</div>
            ) : !idPeriodo ? (
                <div className={styles.emptyState}>Seleccione un periodo para visualizar la comparativa de compras.</div>
            ) : (
              <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                      <thead>
                          <tr>
                              <th>Proveedor</th>
                              <th>Documento</th>
                              <th className={styles.textRight}>SUNAT</th>
                              <th className={styles.textRight}>Local</th>
                              <th className={styles.textRight}>Diferencia</th>
                              <th className={styles.textCenter}>Estado</th>
                          </tr>
                      </thead>
                      <tbody>
                          {data.propuesta.length > 0 ? (
                              data.propuesta.map((p, i) => {
                                  const match = data.local.find(l => 
                                      l.numero_comprobante === p.numero && 
                                      l.serie_comprobante === p.serie
                                  );
                                  
                                  const montoSunat = Number(p.monto_total);
                                  const montoLocal = match ? Number(match.debe) : 0;
                                  const diferencia = montoSunat - montoLocal;

                                  return (
                                      <tr key={i} className={!match ? styles.rowMissing : Math.abs(diferencia) > 0.01 ? styles.rowError : ''}>
                                          <td>
                                              <div className={styles.provInfo}>
                                                  <span className={styles.razonSocial}>{p.razon_social_proveedor}</span>
                                                  <span className={styles.ruc}>RUC: {p.ruc_proveedor}</span>
                                              </div>
                                          </td>
                                          <td>
                                              <div className={styles.docInfo}>
                                                  <span className={styles.docType}>Factura</span>
                                                  <span className={styles.docNum}>{p.serie}-{p.numero}</span>
                                              </div>
                                          </td>
                                          <td className={`${styles.amount} ${styles.textRight}`}>
                                              S/ {montoSunat.toFixed(2)}
                                          </td>
                                          <td className={`${styles.amount} ${styles.textRight}`}>
                                              {match ? `S/ ${montoLocal.toFixed(2)}` : <span className={styles.pendingText}>Pendiente</span>}
                                          </td>
                                          <td className={`${styles.amount} ${styles.textRight} ${diferencia !== 0 ? styles.diffWarning : ''}`}>
                                              {match ? `S/ ${diferencia.toFixed(2)}` : '-'}
                                          </td>
                                          <td className={styles.textCenter}>
                                              {match ? (
                                                  Math.abs(diferencia) <= 0.01 
                                                      ? <span className={styles.badgeOk}>✅ Conciliado</span>
                                                      : <span className={styles.badgeWarning}>⚠️ Diferencia</span>
                                              ) : (
                                                  <span className={styles.badgeError}>❌ Faltante</span>
                                              )}
                                          </td>
                                      </tr>
                                  );
                              })
                          ) : (
                              <tr>
                                  <td colSpan="6" className={styles.emptyTable}>
                                      <div className={styles.noDataContent}>
                                          <span>📂</span>
                                          <p>No se encontraron registros en la propuesta de SUNAT para este periodo.</p>
                                      </div>
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