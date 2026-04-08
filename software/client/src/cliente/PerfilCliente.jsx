import React, { useState, useEffect } from 'react';
import api from '../redux/axios_auth.js';
import styles from './ConfiguracionPerfil.module.css';
import { perfilclientedata } from '../redux/cliente/perfilclientedata.js'
import { perfilclienteConstants } from '../uri/cliente/perfilcliente-constants.js'
import { useDispatch, useSelector } from 'react-redux';
import { constantes } from '../uri/constantes.js';

export default function PerfilCliente() {

    const dispatch = useDispatch();

    const [user, setUser] = useState({ nombre: '', apellido: '', email: '' });
    const [passwords, setPasswords] = useState({ newPass: '', confirmPass: '' });
    const [loading, setLoading] = useState(false);
    
    const [showModal, setShowModal] = useState(false);

    const { get_mi_perfil } = useSelector(({ perfilcliente_data }) => perfilcliente_data);

    useEffect(() => {
        loadData();
    }, [dispatch]);

    const loadData = () => {
        dispatch(perfilclientedata(perfilclienteConstants('0', {}, false).get_mi_perfil));
    };

    useEffect(() => {
        if (get_mi_perfil?.user) {
            setUser(get_mi_perfil.user);
            setLoading(false);
        }
    }, [get_mi_perfil]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post(`${constantes().url_principal[0].url}/api/cliente/perfil`, { 
                ...user, 
                password: passwords.newPass 
            });
            
            if (res.data.success) {
                setShowModal(true);
                setTimeout(() => {
                    setShowModal(false);
                }, 1500);
            }
        } catch (err) {
            console.error("Error al actualizar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.avatarSection}>
                    <div className={styles.avatar}>
                        {user.nombre ? user.nombre[0] : ''}
                        {user.apellido ? user.apellido[0] : ''}
                    </div>
                    <h3>{user.nombre} {user.apellido}</h3>
                    <span className={styles.roleBadge}>{user.rol}</span>
                </div>

                <form onSubmit={handleUpdate} className={styles.form}>
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <label>Nombre</label>
                            <input type="text" value={user.nombre} onChange={e => setUser({...user, nombre: e.target.value})} />
                        </div>
                        <div className={styles.group}>
                            <label>Apellido</label>
                            <input type="text" value={user.apellido} onChange={e => setUser({...user, apellido: e.target.value})} />
                        </div>
                    </div>

                    <div className={styles.group}>
                        <label>Email (No editable)</label>
                        <input type="email" value={user.email} disabled className={styles.disabledInput} />
                    </div>

                    <hr className={styles.divider} />
                    <h4>Seguridad</h4>

                    <div className={styles.group}>
                        <label>Nueva Contraseña</label>
                        <input 
                            type="password" 
                            placeholder="Dejar en blanco para no cambiar" 
                            onChange={e => setPasswords({...passwords, newPass: e.target.value})} 
                        />
                    </div>

                    <button type="submit" className={styles.saveBtn} disabled={loading}>
                        {loading ? 'Guardando...' : 'Actualizar Perfil'}
                    </button>
                </form>
            </div>

            {/* MODAL DE ÉXITO TEMPORIZADO */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.successIcon}>✓</div>
                        <h3>Perfil Actualizado</h3>
                        <p>Los cambios se guardaron correctamente.</p>
                    </div>
                </div>
            )}
        </div>
    );
}