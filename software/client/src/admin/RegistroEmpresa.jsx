import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RegistroEmpresa.module.css';
import api from '../redux/axios_auth.js';
import { constantes } from '../uri/constantes.js';

export default function RegistroEmpresa() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    const [formData, setFormData] = useState({
        ruc: '',
        razon_social: '',
        nombre_comercial: '',
        direccion: '',
        estado_sunat: 'ACTIVO'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post(`${constantes().url_principal[0].url}/api/admin/empresa`, formData);
            if (res.data.success) setShowModal(true);
        } catch (err) {
            alert(err.response?.data?.mensaje || "Error al registrar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.formCard}>
                <h2 className={styles.title}>Registrar Nueva Empresa</h2>
                
                <div className={styles.inputGroup}>
                    <label>Número de RUC</label>
                    <input 
                        type="text" 
                        maxLength="11"
                        value={formData.ruc}
                        onChange={(e) => setFormData({...formData, ruc: e.target.value})}
                        placeholder="20XXXXXXXXX"
                        required 
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Razón Social</label>
                    <input 
                        type="text"
                        value={formData.razon_social}
                        onChange={(e) => setFormData({...formData, razon_social: e.target.value})}
                        placeholder="Nombre legal completo"
                        required 
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Nombre Comercial</label>
                    <input 
                        type="text"
                        value={formData.nombre_comercial}
                        onChange={(e) => setFormData({...formData, nombre_comercial: e.target.value})}
                        placeholder="Nombre de marca (Opcional)"
                    />
                </div>

                {/* CAMPO AGREGADO: Dirección Fiscal */}
                <div className={styles.inputGroup}>
                    <label>Dirección Fiscal</label>
                    <textarea 
                        value={formData.direccion}
                        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                        placeholder="Av. Ejemplo 123, Distrito, Provincia"
                        rows="2"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Estado SUNAT</label>
                    <div className={styles.selectWrapper}>
                        <select 
                            className={`${styles.selectField} ${styles[formData.estado_sunat.toLowerCase()]}`}
                            value={formData.estado_sunat}
                            onChange={(e) => setFormData({...formData, estado_sunat: e.target.value})}
                        >
                            <option value="ACTIVO">✅ ACTIVO</option>
                            <option value="HABIDO">🏠 HABIDO</option>
                        </select>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button 
                        type="button" 
                        className={styles.cancelBtn} 
                        onClick={() => navigate(-1)}
                    >
                        <span className={styles.btnIcon}>←</span>
                        <span className={styles.btnText}>Cancelar</span>
                    </button>
                    <button type="submit" className={styles.saveBtn} disabled={loading}>
                        {loading ? 'Registrando...' : 'Crear Empresa'}
                    </button>
                </div>
            </form>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.successIcon}>✓</div>
                        <h3>Empresa Creada</h3>
                        <p>La empresa ha sido registrada correctamente en el sistema.</p>
                        <button 
                            onClick={() => navigate('/admin/empresas')} 
                            className={styles.modalBtn}
                        >
                            <span className={styles.modalBtnText}>Entendido, ir al listado</span>
                            <svg className={styles.modalBtnIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};