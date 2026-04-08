import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../redux/axios_auth.js';
import styles from './PeriodoForm.module.css';
import { constantes } from '../uri/constantes.js';

export default function PeriodoForm() {

    const navigate = useNavigate();
    
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear()
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post(`${constantes().url_principal[0].url}/api/contador/periodo-crear`, formData);
            
            if (res.data.success) {
                setShowModal(true); // Disparamos el modal de éxito
                
                setTimeout(() => {
                    setShowModal(false);
                    navigate('/contador/periodos');
                }, 1500);
            } else {
                alert(res.data.mensaje || "El periodo ya existe");
            }
        } catch (err) {
            alert("Error al intentar abrir el periodo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Abrir Nuevo Periodo</h2>
                <p className={styles.subtitle}>Seleccione el mes y año para habilitar registros contables.</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Año Fiscal</label>
                        <input 
                            type="number" 
                            value={formData.anio}
                            onChange={(e) => setFormData({...formData, anio: e.target.value})}
                            min="2024"
                            max="2030"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Mes Contable</label>
                        <select 
                            value={formData.mes}
                            onChange={(e) => setFormData({...formData, mes: e.target.value})}
                            required
                        >
                            <option value="1">Enero</option>
                            <option value="2">Febrero</option>
                            <option value="3">Marzo</option>
                            <option value="4">Abril</option>
                            <option value="5">Mayo</option>
                            <option value="6">Junio</option>
                            <option value="7">Julio</option>
                            <option value="8">Agosto</option>
                            <option value="9">Septiembre</option>
                            <option value="10">Octubre</option>
                            <option value="11">Noviembre</option>
                            <option value="12">Diciembre</option>
                        </select>
                    </div>

                    <div className={styles.actions}>
                        <button 
                            type="button" 
                            onClick={() => navigate(-1)} 
                            className={styles.cancelBtn}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className={styles.saveBtn}
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : 'Habilitar Periodo'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal de Éxito Temporal */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.successIcon}>📅</div>
                        <h3>Periodo Habilitado</h3>
                        <p>El nuevo mes contable ya está listo para recibir registros.</p>
                    </div>
                </div>
            )}
        </div>
    );
}