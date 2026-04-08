import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditarUsuarioAdmin.module.css';
import { usuariosadmindata } from '../redux/admin/usuariosadmindata.js';
import { usuariosadminConstants } from '../uri/admin/usuariosadmin-constants.js';
import { useDispatch, useSelector } from 'react-redux';
import { constantes } from '../uri/constantes.js';
import api from '../redux/axios_auth.js';

export default function EditarUsuarioAdmin() {

    const { id } = useParams();
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [userForm, setUserForm] = useState({
        nombre: '', apellido: '', rol: '', estado: 1
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const { get_detalle_usuario } = useSelector(({ usuariosadmin_data }) => usuariosadmin_data);

    useEffect(() => {
        loadData();
    }, [dispatch, id]);

    const loadData = () => {
        dispatch(usuariosadmindata(usuariosadminConstants(id, {}, false).get_detalle_usuario));
    }

    useEffect(() => {
        if (get_detalle_usuario?.usuario) {
            setUserForm({
                nombre: get_detalle_usuario.usuario.nombre || '',
                apellido: get_detalle_usuario.usuario.apellido || '',
                rol: get_detalle_usuario.usuario.rol || '',
                estado: get_detalle_usuario.usuario.estado
            });
        }
    }, [get_detalle_usuario]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`${constantes().url_principal[0].url}/api/admin/usuario/${id}`, userForm);
            if (res.data.success) {
                setShowSuccessModal(true);
            }
        } catch (err) {
            alert(err.response?.data?.mensaje || "Error al actualizar el usuario");
        }
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        navigate('/admin/usuarios');
    };

    return (
        <div className={styles.container}>
            <form className={styles.card} onSubmit={handleSave}>
                <h2>Configuración de Usuario</h2>
                
                <div className={styles.group}>
                    <label>Nombre y Apellido</label>
                    <div className={styles.row}>
                        <input 
                            value={userForm.nombre} 
                            onChange={e => setUserForm({...userForm, nombre: e.target.value})} 
                            placeholder="Nombre"
                            required
                        />
                        <input 
                            value={userForm.apellido} 
                            onChange={e => setUserForm({...userForm, apellido: e.target.value})} 
                            placeholder="Apellido"
                            required
                        />
                    </div>
                </div>

                <div className={styles.group}>
                    <label>Rol en el Sistema</label>
                    <select value={userForm.rol} onChange={e => setUserForm({...userForm, rol: e.target.value})} required>
                        <option value="" disabled>Seleccione un rol</option>
                        <option value="ADMINISTRADOR">ADMINISTRADOR (Agencia)</option>
                        <option value="CONTADOR">CONTADOR (Operativo)</option>
                        <option value="CLIENTE">CLIENTE (Solo lectura)</option>
                    </select>
                </div>

                <div className={styles.group}>
                    <label>Estado de la Cuenta</label>
                    <select value={userForm.estado} onChange={e => setUserForm({...userForm, estado: parseInt(e.target.value)})}>
                        <option value={1}>✅ Activo / Permitir Acceso</option>
                        <option value={0}>🚫 Suspendido / Bloquear Acceso</option>
                    </select>
                </div>

                <div className={styles.footer}>
                    <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>Volver</button>
                    <button type="submit" className={styles.saveBtn}>Guardar Cambios</button>
                </div>
            </form>

            {/* MODAL DE CONFIRMACIÓN */}
            {showSuccessModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.successCircle}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h3>¡Usuario Actualizado!</h3>
                        <p>Los cambios de permisos y datos personales se han aplicado correctamente.</p>
                        <button onClick={handleCloseModal} className={styles.modalConfirmBtn}>
                            Regresar al listado
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}