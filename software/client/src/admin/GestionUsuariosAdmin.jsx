import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './GestionUsuariosAdmin.module.css';
import { usuariosadmindata } from '../redux/admin/usuariosadmindata.js';
import {usuariosadminConstants} from '../uri/admin/usuariosadmin-constants.js'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function GestionUsuariosAdmin ()  {

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    const {get_usuarios} = useSelector(({usuariosadmin_data}) => usuariosadmin_data)

    useEffect(() => {
        loadData()
    }, [dispatch])

    const loadData = () => {
        dispatch (usuariosadmindata(usuariosadminConstants('0', {}, false).get_usuarios))
    }

    useEffect(() => {
        if (get_usuarios?.usuarios){
            setUsuarios(get_usuarios.usuarios)
            setLoading(false)
        }
    }, [get_usuarios])

    if (loading) return <div className={styles.loader}>Cargando usuarios...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Control de Usuarios</h1>
                <button className={styles.addBtn}
                    onClick={() => navigate ('/admin/usuarios/nuevo')}>+ Nuevo Usuario</button>
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Empresa / Tenant</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(u => (
                            <tr key={u.id}>
                                <td className={styles.userName}>{u.nombre} {u.apellido}</td>
                                <td>{u.email}</td>
                                <td className={styles.empresaName}>{u.empresa_nombre}</td>
                                <td>
                                    <span className={`${styles.badge} ${styles[u.rol.toLowerCase()]}`}>
                                        {u.rol}
                                    </span>
                                </td>
                                <td>
                                    <div className={u.estado === 1 ? styles.statusActive : styles.statusInactive}>
                                        {u.estado === 1 ? 'Activo' : 'Suspendido'}
                                    </div>
                                </td>
                                <td>
                                    <button className={styles.editBtn}
                                        onClick={() => navigate (`/admin/usuarios/editar/${u.id}`)}>⚙️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};