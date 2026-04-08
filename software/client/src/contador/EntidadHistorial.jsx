import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../redux/axios_auth.js';
import styles from './EntidadHistorial.module.css';
import { constantes } from '../uri/constantes.js';
import { entidadescontadordata } from '../redux/contador/entidadescontadordata.js';
import { entidadescontadorConstants } from '../uri/contador/entidadescontador-constants.js';
import { useDispatch, useSelector } from 'react-redux';

export default function EntidadHistorial() {

    const { id } = useParams();
    
    const dispatch = useDispatch()
    const navigate = useNavigate();

    const [entidad, setEntidad] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);

    const {get_historial_entidad} = useSelector(({entidadescontador_data}) => entidadescontador_data)

    useEffect(() => {
        loadData()
    }, [dispatch, id])

    const loadData = () => {
        dispatch (entidadescontadordata(entidadescontadorConstants(id, {}, false).get_historial_entidad))
    }
    useEffect(() => {
        if (get_historial_entidad?.entidad){
            setEntidad(get_historial_entidad.entidad)
            setMovimientos(get_historial_entidad?.movimientos)
            setLoading(false)
        }
    }, [get_historial_entidad])

    const totalDebe = movimientos?.length > 0 && movimientos.reduce((acc, m) => acc + Number(m.debe), 0);
    const totalHaber = movimientos?.length > 0 && movimientos.reduce((acc, m) => acc + Number(m.haber), 0);

    if (loading) return <div className={styles.loader}>Consultando historial...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button onClick={() => navigate(-1)} className={styles.backBtn}>← Volver</button>
                <div className={styles.entityInfo}>
                    <h2>{entidad.nombre_razon_social}</h2>
                    <span>RUC/DNI: {entidad.numero_documento}</span>
                </div>
                <div className={styles.balanceSummary}>
                    <div className={styles.stat}>
                        <label>Total Debe</label>
                        <p>S/ {totalDebe.toFixed(2)}</p>
                    </div>
                    <div className={styles.stat}>
                        <label>Total Haber</label>
                        <p>S/ {totalHaber.toFixed(2)}</p>
                    </div>
                    <div className={`${styles.stat} ${styles.total}`}>
                        <label>Saldo Neto</label>
                        <p>S/ {Math.abs(totalDebe - totalHaber).toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Cuenta</th>
                            <th>Glosa</th>
                            <th>Comprobante</th>
                            <th>Debe</th>
                            <th>Haber</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movimientos?.length > 0 && movimientos.map((m, index) => (
                            <tr key={index}>
                                <td>{new Date(m.fecha_asiento).toLocaleDateString()}</td>
                                <td className={styles.code}>{m.cuenta_codigo}</td>
                                <td className={styles.glosa}>{m.glosa}</td>
                                <td>{m.tipo_comprobante} {m.serie_comprobante}-{m.numero_comprobante}</td>
                                <td className={styles.debe}>{Number(m.debe).toFixed(2)}</td>
                                <td className={styles.haber}>{Number(m.haber).toFixed(2)}</td>
                                <td>
                                    <button 
                                        className={styles.viewBtn}
                                        onClick={() => navigate(`/contador/asientos/detalle/${m.id_asiento}`)}
                                    >
                                        Ver Asiento
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}