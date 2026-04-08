import React, { useState, useEffect } from 'react';
import api from '../redux/axios_auth.js';
import styles from './EntidadesLista.module.css';
import { constantes } from '../uri/constantes.js';
import { entidadescontadordata } from '../redux/contador/entidadescontadordata.js';
import {entidadescontadorConstants} from '../uri/contador/entidadescontador-constants.js'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function EntidadesLista() {

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [entidades, setEntidades] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);

    const {get_entidades} = useSelector(({entidadescontador_data}) => entidadescontador_data)

    useEffect(() => {
        loadData()
    }, [dispatch])

    const loadData = () => {
        dispatch (entidadescontadordata(entidadescontadorConstants('0', {}, false).get_entidades))
    }

    useEffect(() => {
        if (get_entidades?.entidades){
            setEntidades(get_entidades.entidades)
            setLoading(false)
        }
    }, [get_entidades])

    const filtradas = entidades?.length > 0 && entidades.filter(e => 
        e.nombre_razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.numero_documento.includes(busqueda)
    );

    if (loading) return <div className={styles.loader}>Cargando directorio de entidades...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h2>Clientes y Proveedores</h2>
                    <p>Gestión de RUC/DNI para registros contables</p>
                </div>
                <div className={styles.actions}>
                    <input 
                        type="text" 
                        placeholder="Buscar por RUC o Nombre..." 
                        className={styles.search}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <button className={styles.addBtn}>+ Nueva Entidad</button>
                </div>
            </div>

            <div className={styles.grid}>
                {filtradas?.length > 0 && filtradas.map(ent => (
                    <div key={ent.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.docType}>{ent.tipo_documento}</span>
                            <span className={`${styles.badge} ${styles[ent.tipo_entidad]}`}>
                                {ent.tipo_entidad}
                            </span>
                        </div>
                        <h3 className={styles.name}>{ent.nombre_razon_social}</h3>
                        <p className={styles.document}>{ent.numero_documento}</p>
                        <div className={styles.contactInfo}>
                            <span>📞 {ent.telefono || 'Sin tel.'}</span>
                            <span>✉️ {ent.email || 'Sin correo'}</span>
                        </div>
                        <div className={styles.cardActions}>
                            <button className={styles.editBtn}
                                onClick={() => navigate (`/contador/entidades/editar/${ent.id}`)}>Editar</button>
                            <button className={styles.historyBtn}
                                onClick={() => navigate (`/contador/entidades/historial/${ent.id}`)}>Ver Historial</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}