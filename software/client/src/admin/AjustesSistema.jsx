import React, { useState, useEffect } from 'react';
import styles from './ConfiguracionAdmin.module.css';
import { configadmindata } from '../redux/admin/configadmindata.js'
import { configadminConstants } from '../uri/admin/configadmin-constants.js'
import { useDispatch, useSelector } from 'react-redux';
import { constantes } from '../uri/constantes.js';
import api from '../redux/axios_auth.js';

export default function ConfiguracionAdmin() {
    const dispatch = useDispatch();
    
    const [config, setConfig] = useState({
        igv_actual: 18,
        moneda_defecto: 'PEN',
        smtp_host: '',
        smtp_user: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false); // Estado para el modal

    const { get_configuracion } = useSelector(({ configadmin_data }) => configadmin_data);

    useEffect(() => {
        loadData();
    }, [dispatch]);

    const loadData = () => {
        dispatch(configadmindata(configadminConstants('0', {}, false).get_configuracion));
    }

    useEffect(() => {
        if (get_configuracion?.config) {
            setConfig(get_configuracion.config);
            setLoading(false);
        }
    }, [get_configuracion]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post(`${constantes().url_principal[0].url}/api/admin/configuracion`, config);
            if (res.data.success) {
                setShowModal(true); // Mostrar modal si la respuesta es exitosa
            }
        } catch (err) {
            alert(err.response?.data?.mensaje || "Error al actualizar la configuración");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Configuración del Sistema</h1>
                <p>Ajustes globales para Developer Ideas Contable</p>
            </header>

            <form onSubmit={handleSave} className={styles.formGrid}>
                {/* SECCIÓN CONTABLE */}
                <section className={styles.sectionCard}>
                    <h3>⚙️ Parámetros Contables</h3>
                    <div className={styles.inputGroup}>
                        <label>IGV (%)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            value={config.igv_actual} 
                            onChange={(e) => setConfig({...config, igv_actual: e.target.value})} 
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Moneda del Sistema</label>
                        <select value={config.moneda_defecto} onChange={(e) => setConfig({...config, moneda_defecto: e.target.value})}>
                            <option value="PEN">Soles (PEN)</option>
                            <option value="USD">Dólares (USD)</option>
                        </select>
                    </div>
                </section>

                {/* SECCIÓN CORREO (SMTP) */}
                <section className={styles.sectionCard}>
                    <h3>📧 Servidor de Notificaciones</h3>
                    <div className={styles.inputGroup}>
                        <label>Host SMTP</label>
                        <input type="text" value={config.smtp_host} onChange={(e) => setConfig({...config, smtp_host: e.target.value})} placeholder="ej. smtp.gmail.com" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Usuario SMTP</label>
                        <input type="email" value={config.smtp_user} onChange={(e) => setConfig({...config, smtp_user: e.target.value})} placeholder="correo@empresa.com" />
                    </div>
                </section>

                <div className={styles.actions}>
                    <button type="submit" className={styles.saveBtn} disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Configuración Global'}
                    </button>
                </div>
            </form>

            {/* MODAL DE CONFIRMACIÓN */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.successIcon}>⚙️</div>
                        <h3>Configuración Actualizada</h3>
                        <p>Los parámetros globales han sido guardados. Los cambios se aplicarán a todas las empresas del sistema.</p>
                        <button onClick={() => setShowModal(false)} className={styles.modalBtn}>
                            Aceptar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}