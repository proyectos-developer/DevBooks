import React, { useState, useEffect } from 'react';
import styles from './PlanContableLista.module.css';
import { contablecontadordata } from '../redux/contador/contablecontadordata.js';
import { contablecontadorConstants } from '../uri/contador/contablecontador-constants.js';
import { useDispatch, useSelector } from 'react-redux';

export default function PlanContableLista() {
    const dispatch = useDispatch();

    const [cuentas, setCuentas] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [loading, setLoading] = useState(true);

    const { get_plan_contable } = useSelector(({ contablecontador_data }) => contablecontador_data);

    useEffect(() => {
        setLoading(true); // Iniciamos el loading al disparar la acción
        loadData();
    }, [dispatch]);

    const loadData = () => {
        dispatch(contablecontadordata(contablecontadorConstants('0', {}, false).get_plan_contable));
    };

    useEffect(() => {
        if (get_plan_contable?.cuentas) {
            setCuentas(get_plan_contable.cuentas);
            setTimeout(() => setLoading(false), 500);
        }
    }, [get_plan_contable]);

    const cuentasFiltradas = cuentas?.length > 0 && cuentas.filter(c => 
        c.codigo.includes(filtro) || 
        c.descripcion.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h2>Plan Contable General</h2>
                    <p>Estructura de cuentas para la empresa actual</p>
                </div>
                <input 
                    type="text" 
                    placeholder="🔍 Buscar por código o nombre..." 
                    className={styles.searchBar}
                    onChange={(e) => setFiltro(e.target.value)}
                />
            </div>

            {/* APLICACIÓN DEL LOADING */}
            {loading ? (
                <div className={styles.loaderContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando Plan Contable...</p>
                </div>
            ) : (
                <div className={styles.tableCard}>
                    {cuentasFiltradas.length > 0 ? (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Descripción</th>
                                    <th>Nivel</th>
                                    <th>Tipo</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cuentasFiltradas.map(cta => (
                                    <tr key={cta.id} className={cta.nivel === 1 ? styles.rowPrincipal : ''}>
                                        <td className={styles.codeCell}>{cta.codigo}</td>
                                        <td>{cta.descripcion}</td>
                                        <td><span className={styles.levelBadge}>Nivel {cta.nivel}</span></td>
                                        <td>{cta.tipo_cuenta}</td>
                                        <td>
                                            {cta.permite_movimiento ? 
                                                <span className={styles.activeTag}>Acepta Movimientos</span> : 
                                                <span className={styles.parentTag}>Cuenta Registro</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.noData}>
                            <p>No se encontraron cuentas con el filtro: <strong>{filtro}</strong></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}