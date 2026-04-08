import React, { useState, useEffect } from 'react';
import styles from './LibroDiarioLista.module.css';
import {asientoscontadordata} from '../redux/contador/asientoscontadordata.js'
import {asientoscontadorConstants} from '../uri/contador/asientoscontador-constants.js'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function LibroDiarioLista() {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [asientos, setAsientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    const {get_asientos} = useSelector(({asientoscontador_data}) => asientoscontador_data)

    useEffect(() => {
        loadData()
    }, [dispatch])

    const loadData = () => {
        dispatch(asientoscontadordata(asientoscontadorConstants('0', {}, false).get_asientos))
    }

    useEffect(() => {
        if (get_asientos?.asientos){
            setAsientos(get_asientos.asientos)
            setLoading(false)
        }
    }, [get_asientos])

    const filtrados = asientos?.length > 0 && asientos.filter(a => 
        a.glosa.toLowerCase().includes(busqueda.toLowerCase()) ||
        a.tipo_libro.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) return <div className={styles.loader}>Cargando Libro Diario...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <h2>Libro Diario General</h2>
                    <span>{asientos.length} registros encontrados</span>
                </div>
                <input 
                    type="text" 
                    placeholder="Filtrar por glosa o libro..." 
                    className={styles.search}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Periodo</th>
                            <th>Libro</th>
                            <th>Glosa / Descripción</th>
                            <th>Moneda</th>
                            <th>Usuario</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtrados?.length > 0 && filtrados.map(asiento => (
                            <tr key={asiento.id}>
                                <td>{new Date(asiento.fecha_asiento).toLocaleDateString()}</td>
                                <td>{asiento.mes}/{asiento.anio}</td>
                                <td>
                                    <span className={`${styles.badge} ${styles[asiento.tipo_libro]}`}>
                                        {asiento.tipo_libro}
                                    </span>
                                </td>
                                <td className={styles.glosaText}>{asiento.glosa}</td>
                                <td>{asiento.moneda}</td>
                                <td>{asiento.usuario_registro}</td>
                                <td>
                                    <button className={styles.detailBtn}
                                    onClick={() => navigate (`/contador/asientos/detalle/${asiento.id}`)}>Ver Detalle</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}