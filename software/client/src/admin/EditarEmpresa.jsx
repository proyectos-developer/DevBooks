import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditarEmpresa.module.css';
import { empresasadmindata } from '../redux/admin/empresasadmindata.js';
import { empresasadminConstants } from '../uri/admin/empresasadmin-constants.js'
import { useDispatch, useSelector } from 'react-redux';
import api from '../redux/axios_auth.js';
import { constantes } from '../uri/constantes.js';

export default function EditarEmpresa() {

    const { id } = useParams();
    
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        razon_social: '',
        nombre_comercial: '',
        direccion: '',
        estado_sunat: ''
    });

    const [showModal, setShowModal] = useState(false);
    const { get_empresa } = useSelector(({ empresasadmin_data }) => empresasadmin_data);

    useEffect(() => {
        loadData();
    }, [dispatch, id]);

    const loadData = () => {
        dispatch(empresasadmindata(empresasadminConstants(id, {}, false).get_empresa));
    }

    useEffect(() => {
        if (get_empresa?.empresa) {
            setFormData({
                razon_social: get_empresa.empresa.razon_social || '',
                nombre_comercial: get_empresa.empresa.nombre_comercial || '',
                direccion: get_empresa.empresa.direccion || '',
                estado_sunat: get_empresa.empresa.estado_sunat || ''
            });
        }
    }, [get_empresa]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`${constantes().url_principal[0].url}/api/admin/empresa/${id}`, formData);
            if (res.data.success) {
                setShowModal(true);
            }
        } catch (err) {
            alert("Error al actualizar los datos de la empresa");
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        navigate('/admin/empresas'); 
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.formCard}>
                <h2 className={styles.formTitle}>Editar Datos de Empresa</h2>
                
                <div className={styles.inputGroup}>
                    <label>Razón Social</label>
                    <input 
                        value={formData.razon_social} 
                        onChange={(e) => setFormData({...formData, razon_social: e.target.value})}
                        placeholder="Ej. Developer Ideas E.I.R.L."
                        required 
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Nombre Comercial</label>
                    <input 
                        value={formData.nombre_comercial} 
                        onChange={(e) => setFormData({...formData, nombre_comercial: e.target.value})}
                        placeholder="Ej. Developer Ideas"
                    />
                </div>
                
                <div className={styles.inputGroup}>
                    <label className={styles.label}>
                        <span className={styles.labelIcon}>📊</span> Estado SUNAT
                    </label>
                    <div className={styles.selectWrapper}>
                        <select 
                            className={`${styles.selectField} ${styles[formData.estado_sunat?.toLowerCase().replace(/\s/g, '_')]}`}
                            value={formData.estado_sunat} 
                            onChange={(e) => setFormData({...formData, estado_sunat: e.target.value})}
                            required
                        >
                            <option value="" disabled>Seleccione un estado oficial</option>
                            <option value="ACTIVO">✅ ACTIVO</option>
                            <option value="HABIDO">🏠 HABIDO</option>
                            <option value="BAJA DE OFICIO">🚫 BAJA DE OFICIO</option>
                            <option value="SUSPENSION TEMPORAL">⏳ SUSPENSIÓN TEMPORAL</option>
                        </select>
                        <span className={styles.customArrow}></span>
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label>Dirección Fiscal</label>
                    <textarea 
                        value={formData.direccion} 
                        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                        rows="3"
                    />
                </div>

                <div className={styles.actions}>
                    <button 
                        type="button" 
                        className={styles.cancelBtn} 
                        onClick={() => navigate(-1)}
                        title="Volver sin guardar cambios"
                    >
                        <span className={styles.btnIcon}>←</span>
                        <span className={styles.btnText}>Cancelar</span>
                    </button>
                    <button type="submit" className={styles.saveBtn}>
                        Guardar Cambios
                    </button>
                </div>
            </form>

            {/* MODAL DE CONFIRMACIÓN */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.successIcon}>✓</div>
                        <h3>¡Actualización Exitosa!</h3>
                        <p>Los datos de la empresa han sido actualizados correctamente en el sistema.</p>
                        <button onClick={handleCloseModal} className={styles.modalBtn}>
                            Continuar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};