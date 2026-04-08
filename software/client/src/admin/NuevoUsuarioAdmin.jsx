import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './NuevoUsuarioAdmin.module.css';
import { empresasadmindata } from '../redux/admin/empresasadmindata.js';
import { empresasadminConstants } from '../uri/admin/empresasadmin-constants.js';
import { useDispatch, useSelector } from 'react-redux';
import api from '../redux/axios_auth.js';
import { constantes } from '../uri/constantes.js';

export default function NuevoUsuarioAdmin() {

    const navigate = useNavigate();
    const dispatch = useDispatch()
    
    const [empresas, setEmpresas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id_empresa: '',
        nombre: '',
        apellido: '',
        email: '',
        rol: 'CONTADOR'
    });

    const {get_empresas} = useSelector(({empresasadmin_data}) => empresasadmin_data)

    useEffect(() => {
        loadData()
    }, [dispatch])

    const loadData = () => {
        dispatch (empresasadmindata(empresasadminConstants('0', {}, false).get_empresas))
    }

    useEffect(() => {
        if (get_empresas?.empresas){
            setEmpresas(get_empresas.empresas)
        }
    }, [get_empresas])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`${constantes().url_principal[0].url}/api/admin/usuario`, formData);
            if (res.data.success) setShowModal(true);
        } catch (err) {
            alert(err.response?.data?.mensaje || "Error al crear");
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.formCard}>
                <h2 className={styles.title}>Registrar Usuario Multi-tenant</h2>
                
                <div className={styles.inputGroup}>
                    <label>Asignar a Empresa</label>
                    <select 
                        required 
                        value={formData.id_empresa} 
                        onChange={(e) => setFormData({...formData, id_empresa: e.target.value})}
                    >
                        <option value="">Seleccione una empresa cliente</option>
                        {empresas.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.razon_social} ({emp.ruc})</option>
                        ))}
                    </select>
                </div>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>Nombre</label>
                        <input type="text" required onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Apellido</label>
                        <input type="text" required onChange={(e) => setFormData({...formData, apellido: e.target.value})} />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label>Email Corporativo</label>
                    <input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className={styles.inputGroup}>
                    <label>Rol asignado</label>
                    <select value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})}>
                        <option value="CONTADOR">CONTADOR (Gestión completa)</option>
                        <option value="CLIENTE">CLIENTE (Solo visualización)</option>
                        <option value="ADMINISTRADOR">ADMINISTRADOR (Agencia)</option>
                    </select>
                </div>

                <div className={styles.actions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => navigate(-1)}>Cancelar</button>
                    <button type="submit" className={styles.saveBtn}>Crear Acceso</button>
                </div>
            </form>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.successIcon}>👤</div>
                        <h3>¡Usuario Creado!</h3>
                        <p>Se ha enviado el acceso. La contraseña por defecto es: <strong>Temporal123!</strong></p>
                        <button onClick={() => navigate('/admin/usuarios')} className={styles.modalBtn}>
                            Volver al listado
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}