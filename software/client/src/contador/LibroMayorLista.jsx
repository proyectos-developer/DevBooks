import React, { useState, useEffect } from 'react';
import api from '../redux/axios_auth.js';
import styles from './LibroMayor.module.css';
import { constantes } from '../uri/constantes.js';

export default function LibroMayorLista() {

    const [periodos, setPeriodos] = useState([]);
    const [idPeriodo, setIdPeriodo] = useState('');
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get(`${constantes().url_principal[0].url}/api/contador/periodos-all`)
           .then(res => setPeriodos(res.data.periodos));
    }, []);

    const cargarMayor = async (id) => {
        setIdPeriodo(id);
        if(!id) return;
        setLoading(true);
        try {
            const res = await api.get(`${constantes().url_principal[0].url}/api/contador/libro-mayor/${id}`);
            if (res.data.success) setMovimientos(res.data.movimientos);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const cuentasAgrupadas = movimientos.reduce((acc, mov) => {
        if (!acc[mov.cuenta_codigo]) acc[mov.cuenta_codigo] = { nombre: mov.cuenta_nombre, items: [] };
        acc[mov.cuenta_codigo].items.push(mov);
        return acc;
    }, {});

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Libro Mayor Principal</h2>
                <select className={styles.select} onChange={(e) => cargarMayor(e.target.value)}>
                    <option value="">-- Seleccionar Periodo --</option>
                    {periodos.map(p => <option key={p.id} value={p.id}>{p.mes}/{p.anio}</option>)}
                </select>
            </div>

            {loading ? <div className={styles.loader}>Procesando mayor...</div> : (
                Object.keys(cuentasAgrupadas).map(codigo => (
                    <div key={codigo} className={styles.accountSection}>
                        <div className={styles.accountHeader}>
                            <strong>Cuenta: {codigo}</strong> - {cuentasAgrupadas[codigo].nombre}
                        </div>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Glosa / Concepto</th>
                                    <th>Doc.</th>
                                    <th>Debe</th>
                                    <th>Haber</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cuentasAgrupadas[codigo].items.map((m, i) => (
                                    <tr key={i}>
                                        <td>{new Date(m.fecha_asiento).toLocaleDateString()}</td>
                                        <td>{m.glosa}</td>
                                        <td>{m.serie_comprobante}-{m.numero_comprobante}</td>
                                        <td className={styles.amount}>{Number(m.debe).toFixed(2)}</td>
                                        <td className={styles.amount}>{Number(m.haber).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))
            )}
        </div>
    );
}