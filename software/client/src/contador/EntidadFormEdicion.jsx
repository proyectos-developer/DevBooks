import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../redux/axios_auth.js';
import styles from './EntidadForm.module.css';
import { constantes } from '../uri/constantes.js';
import { entidadescontadordata } from '../redux/contador/entidadescontadordata.js';
import { entidadescontadorConstants } from '../uri/contador/entidadescontador-constants.js';
import { useDispatch, useSelector } from 'react-redux';

export default function EntidadFormEdicion() {

    const { id } = useParams();
  
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    const [entidad, setEntidad] = useState({
        nombre_razon_social: '',
        tipo_documento: '6', // Por defecto RUC
        numero_documento: '',
        direccion: '',
        es_cliente: 1,
        es_proveedor: 0
    });

    const { get_detalle_entidad } = useSelector(({ entidadescontador_data }) => entidadescontador_data);

    useEffect(() => {
        loadData();
    }, [dispatch, id]);

    const loadData = () => {
        dispatch(entidadescontadordata(entidadescontadorConstants(id, {}, false).get_detalle_entidad));
    };

    useEffect(() => {
        if (get_detalle_entidad?.entidad) {
            setEntidad(get_detalle_entidad.entidad);
            setLoading(false);
        }
    }, [get_detalle_entidad]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...entidad,
                es_cliente: entidad.es_cliente ? 1 : 0,
                es_proveedor: entidad.es_proveedor ? 1 : 0
            };

            const res = await api.post(`${constantes().url_principal[0].url}/api/contador/entidad/${id}`, payload);
            
            if (res.data.success) {
                setShowModal(true);
                setTimeout(() => {
                    setShowModal(false);
                    navigate('/contador/entidades');
                }, 1500);
            }
        } catch (err) {
            alert("Error al guardar cambios: Verifique que el documento no esté duplicado.");
        }
    };

    if (loading) return <div className={styles.loader}>Cargando datos de la entidad...</div>;

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h2 className={styles.title}>Editar Entidad</h2>
                <p className={styles.subtitle}>Configuración para: <strong>{entidad.numero_documento}</strong></p>

                <div className={styles.grid}>
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label>Nombre o Razón Social</label>
                        <input 
                            type="text" 
                            required
                            value={entidad.nombre_razon_social}
                            onChange={(e) => setEntidad({...entidad, nombre_razon_social: e.target.value.toUpperCase()})}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Tipo de Documento</label>
                        <select 
                            value={entidad.tipo_documento}
                            onChange={(e) => setEntidad({...entidad, tipo_documento: e.target.value})}
                        >
                            <option value="1">DNI (Persona Natural)</option>
                            <option value="6">RUC (Persona Jurídica)</option>
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>N° Documento</label>
                        <input 
                            type="text" 
                            readOnly // Normalmente no se edita el RUC si ya tiene historial
                            className={styles.readOnlyInput}
                            value={entidad.numero_documento}
                        />
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label>Dirección Fiscal</label>
                        <textarea 
                            rows="2"
                            value={entidad.direccion || ''}
                            onChange={(e) => setEntidad({...entidad, direccion: e.target.value})}
                        ></textarea>
                    </div>

                    {/* Checkboxes para es_cliente y es_proveedor (TINYINT) */}
                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkLabel}>
                            <input 
                                type="checkbox" 
                                checked={!!entidad.es_cliente} 
                                onChange={(e) => setEntidad({...entidad, es_cliente: e.target.checked ? 1 : 0})}
                            />
                            Es Cliente
                        </label>
                        <label className={styles.checkLabel}>
                            <input 
                                type="checkbox" 
                                checked={!!entidad.es_proveedor} 
                                onChange={(e) => setEntidad({...entidad, es_proveedor: e.target.checked ? 1 : 0})}
                            />
                            Es Proveedor
                        </label>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={() => navigate(-1)} className={styles.cancelBtn}>Cancelar</button>
                    <button type="submit" className={styles.saveBtn}>Actualizar Entidad</button>
                </div>
            </form>

            {/* Modal de Éxito Temporal */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.successIcon}>✓</div>
                        <h3>Entidad Actualizada</h3>
                        <p>Los cambios se guardaron correctamente.</p>
                    </div>
                </div>
            )}
        </div>
    );
}