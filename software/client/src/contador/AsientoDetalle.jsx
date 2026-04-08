import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../redux/axios_auth.js';
import styles from './AsientoDetalle.module.css';
import { constantes } from '../uri/constantes.js';
import { asientoscontadordata } from '../redux/contador/asientoscontadordata.js';
import { asientoscontadorConstants } from '../uri/contador/asientoscontador-constants.js';
import { useDispatch, useSelector } from 'react-redux';

export default function AsientoDetalle() {

    const { id } = useParams();
  
    const dispatch = useDispatch()
    const navigate = useNavigate();

    const [cabecera, setCabecera] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [loading, setLoading] = useState(true);

    const {get_detalle_asiento} = useSelector(({asientoscontador_data}) => asientoscontador_data)

    useEffect(() => {
      loadData()
    }, [dispatch, id])

    const loadData = () => {
      dispatch (asientoscontadordata(asientoscontadorConstants(id, {}, false).get_detalle_asiento))
    }

    useEffect(() => {
      if (get_detalle_asiento?.cabecera){
        setCabecera(get_detalle_asiento.cabecera)
        setDetalles(get_detalle_asiento?.detalles)
        setLoading(false)
      }
    }, [get_detalle_asiento])

    if (loading) return <div className={styles.loader}>Cargando detalle del asiento...</div>;
    if (!cabecera) return <div>No se encontró el registro.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.topActions}>
                <button onClick={() => navigate(-1)} className={styles.backBtn}>← Volver</button>
                <button onClick={() => window.print()} className={styles.printBtn}>🖨️ Imprimir Voucher</button>
            </div>

            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2>Voucher Contable #{cabecera.id}</h2>
                    <span className={styles.badge}>{cabecera.tipo_libro}</span>
                </div>

                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}><strong>Fecha:</strong> {new Date(cabecera.fecha_asiento).toLocaleDateString()}</div>
                    <div className={styles.infoItem}><strong>Periodo:</strong> {cabecera.mes}/{cabecera.anio}</div>
                    <div className={styles.infoItem}><strong>Moneda:</strong> {cabecera.moneda}</div>
                    <div className={styles.infoItem}><strong>Usuario:</strong> {cabecera.usuario}</div>
                    <div className={`${styles.infoItem} ${styles.full}`}><strong>Glosa:</strong> {cabecera.glosa}</div>
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Cuenta</th>
                            <th>Descripción</th>
                            <th>Debe</th>
                            <th>Haber</th>
                            <th>Documento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detalles.map(det => (
                            <tr key={det.id}>
                                <td className={styles.code}>{det.codigo}</td>
                                <td>{det.cuenta_nombre}</td>
                                <td className={styles.amount}>{Number(det.debe).toFixed(2)}</td>
                                <td className={styles.amount}>{Number(det.haber).toFixed(2)}</td>
                                <td className={styles.docInfo}>
                                    {det.tipo_comprobante ? `${det.tipo_comprobante} ${det.serie_comprobante}-${det.numero_comprobante}` : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className={styles.totalRow}>
                            <td colSpan="2">TOTALES</td>
                            <td className={styles.totalAmount}>
                                {detalles.reduce((acc, d) => acc + Number(d.debe), 0).toFixed(2)}
                            </td>
                            <td className={styles.totalAmount}>
                                {detalles.reduce((acc, d) => acc + Number(d.haber), 0).toFixed(2)}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </section>
        </div>
    );
}