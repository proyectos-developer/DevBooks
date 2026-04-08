import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GestionEmpresas.module.css';
import {empresasadmindata} from '../redux/admin/empresasadmindata.js'
import {empresasadminConstants} from '../uri/admin/empresasadmin-constants.js'
import { useDispatch, useSelector } from 'react-redux';

export default function GestionEmpresas(){

    const dispatch = useDispatch()
    const navigate = useNavigate();

    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);

    const {get_empresas} = useSelector(({empresasadmin_data}) => empresasadmin_data)

    useEffect(() => {
      loadData ()
    }, [dispatch]);

    const loadData = () => {
      dispatch (empresasadmindata(empresasadminConstants('0', {}, false).get_empresas))
    }

    useEffect(() => {
      if (get_empresas?.empresas){
        setEmpresas(get_empresas.empresas)
        setLoading(false)
      }
    }, [get_empresas])

    if (loading) return <div className={styles.loader}>Cargando empresas...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Gestión de Empresas</h1>
                    <p className={styles.subtitle}>Administra los tenants del sistema contable</p>
                </div>
                <button 
                    className={styles.addBtn} 
                    onClick={() => navigate('/admin/empresas/nueva')}
                >
                    + Nueva Empresa
                </button>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>RUC</th>
                            <th>Razón Social</th>
                            <th>Nombre Comercial</th>
                            <th>Estado SUNAT</th>
                            <th>Fecha Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {empresas.map((emp) => (
                            <tr key={emp.id}>
                                <td className={styles.rucCol}>{emp.ruc}</td>
                                <td>{emp.razon_social}</td>
                                <td>{emp.nombre_comercial || '-'}</td>
                                <td>
                                    <span className={`${styles.status} ${styles[emp.estado_sunat?.toLowerCase()]}`}>
                                        {emp.estado_sunat}
                                    </span>
                                </td>
                                <td>{new Date(emp.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button className={styles.editBtn}
                                      onClick={() => navigate (`/admin/empresas/editar/${emp.id}`)}>Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};