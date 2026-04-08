import React, { useState, useEffect } from 'react';
import api from '../redux/axios_auth.js';
import styles from './Balance.module.css';
import { contablecontadordata } from '../redux/contador/contablecontadordata.js';
import { contablecontadorConstants } from '../uri/contador/contablecontador-constants.js';
import { constantes } from '../uri/constantes.js';
import { useDispatch, useSelector } from 'react-redux';

export default function BalanceComprobacion() {

    const dispatch = useDispatch();

    const [periodos, setPeriodos] = useState([]);
    const [idPeriodoSeleccionado, setIdPeriodoSeleccionado] = useState('');
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(false);

    const { get_balance_comprobacion } = useSelector(({ contablecontador_data }) => contablecontador_data);

    useEffect(() => {
        const fetchPeriodos = async () => {
            try {
                const url = `${constantes().url_principal[0].url}/api/contador/periodos-abiertos`;
                const res = await api.get(url);
                if (res.data.success) {
                    setPeriodos(res.data.periodos);
                }
            } catch (error) {
                console.error("Error al obtener periodos:", error);
            }
        };
        fetchPeriodos();
    }, []);

    useEffect(() => {
        if (idPeriodoSeleccionado) {
            setLoading(true);
            dispatch(contablecontadordata(contablecontadorConstants(idPeriodoSeleccionado, {}, false).get_balance_comprobacion));
        }
    }, [idPeriodoSeleccionado, dispatch]);

    useEffect(() => {
        if (get_balance_comprobacion?.data) {
            setDatos(get_balance_comprobacion.data);
            setLoading(false);
        }
    }, [get_balance_comprobacion]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h2>Balance de Comprobación</h2>
                    <div className={styles.selectorContainer}>
                        <label>Seleccionar Mes:</label>
                        <select 
                            className={styles.selectPeriodo}
                            value={idPeriodoSeleccionado}
                            onChange={(e) => setIdPeriodoSeleccionado(e.target.value)}
                        >
                            <option value="">-- Seleccione un periodo --</option>
                            {periodos.map(p => (
                                <option key={p.id} value={p.id}>{p.mes}/{p.anio}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button className={styles.exportBtn} disabled={!idPeriodoSeleccionado}>
                    📥 Exportar Excel
                </button>
            </div>

            {loading ? (
                <div className={styles.loaderContainer}>
                    <div className={styles.spinner}></div>
                    <p>Calculando saldos del periodo...</p>
                </div>
            ) : (
                <div className={styles.tableCard}>
                    {idPeriodoSeleccionado ? (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th rowSpan="2">Cuenta</th>
                                    <th rowSpan="2">Descripción</th>
                                    <th colSpan="2" className={styles.centerText}>Sumas del Mayor</th>
                                    <th colSpan="2" className={styles.centerText}>Saldos</th>
                                </tr>
                                <tr>
                                    <th>Debe</th>
                                    <th>Haber</th>
                                    <th>Deudor</th>
                                    <th>Acreedor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datos.length > 0 ? (
                                    datos.map((item, index) => (
                                        <tr key={index}>
                                            <td className={styles.code}>{item.codigo}</td>
                                            <td>{item.descripcion}</td>
                                            <td className={styles.amount}>{Number(item.suma_debe).toFixed(2)}</td>
                                            <td className={styles.amount}>{Number(item.suma_haber).toFixed(2)}</td>
                                            <td className={styles.saldo}>
                                                {item.saldo_deudor > 0 ? Number(item.saldo_deudor).toFixed(2) : '0.00'}
                                            </td>
                                            <td className={styles.saldo}>
                                                {item.saldo_acreedor > 0 ? Number(item.saldo_acreedor).toFixed(2) : '0.00'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className={styles.noData}>No hay movimientos registrados en este periodo.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.welcomeMessage}>
                            <p>Seleccione un periodo contable para visualizar el balance.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}