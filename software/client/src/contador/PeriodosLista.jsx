import React, { useState, useEffect } from 'react';
import api from '../redux/axios_auth.js';
import styles from './PeriodosLista.module.css';
import { constantes } from '../uri/constantes.js';
import { periodoscontadordata } from '../redux/contador/periodoscontadordata.js'
import { periodoscontadorConstants } from '../uri/contador/periodoscontador-constants.js'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function PeriodosLista() {

    const navigate = useNavigate()
    const dispatch = useDispatch();
    
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para el Modal de Confirmación
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPeriodo, setSelectedPeriodo] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const { get_periodos_all } = useSelector(({ periodoscontador_data }) => periodoscontador_data);

    useEffect(() => {
        loadData();
    }, [dispatch]);

    const loadData = () => {
        setLoading(true);
        dispatch(periodoscontadordata(periodoscontadorConstants('0', {}, false).get_periodos_all));
    };

    useEffect(() => {
        if (get_periodos_all?.periodos) {
            setPeriodos(get_periodos_all.periodos);
            setLoading(false);
        }
    }, [get_periodos_all]);

    const handleOpenModal = (periodo) => {
        setSelectedPeriodo(periodo);
        setIsModalOpen(true);
    };

    const confirmCierre = async () => {
        if (!selectedPeriodo) return;
        
        setIsProcessing(true);
        try {
            const url = `${constantes().url_principal[0].url}/api/contador/periodos-cerrar/${selectedPeriodo.id}`;
            const res = await api.post(url);
            
            if (res.data.success) {
                loadData(); // Recarga la lista desde Redux
                setIsModalOpen(false);
            }
        } catch (err) {
            alert("Error al procesar el cierre del mes");
        } finally {
            setIsProcessing(false);
            setSelectedPeriodo(null);
        }
    };

    if (loading && periodos.length === 0) return <div className={styles.loader}>Cargando calendario...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <h2>Gestión de Periodos</h2>
                    <p>Control de apertura y cierre de libros mensuales</p>
                </div>
                <button className={styles.addBtn}
                    onClick={() => navigate ('/contador/periodos/nuevo')}>+ Abrir Nuevo Año/Mes</button>
            </div>

            <div className={styles.grid}>
                {periodos.map(p => (
                    <div key={p.id} className={`${styles.card} ${p.cerrado ? styles.closed : styles.open}`}>
                        <div className={styles.cardHeader}>
                            <span className={styles.year}>{p.anio}</span>
                            <span className={styles.statusBadge}>{p.cerrado ? '🔒 CERRADO' : '🔓 ABIERTO'}</span>
                        </div>
                        <h3 className={styles.monthName}>
                            {new Date(2000, p.mes - 1).toLocaleString('es-ES', { month: 'long' }).toUpperCase()}
                        </h3>
                        <div className={styles.cardActions}>
                            {!p.cerrado ? (
                                <button className={styles.closeBtn} onClick={() => handleOpenModal(p)}>
                                    Realizar Cierre Mensual
                                </button>
                            ) : (
                                <button className={styles.reportBtn}>Reportes Finales</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DE CONFIRMACIÓN */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.warningIcon}>⚠️</div>
                        <h3>Confirmar Cierre Mensual</h3>
                        <p>
                            ¿Está seguro de cerrar el periodo <strong>{new Date(2000, selectedPeriodo.mes - 1).toLocaleString('es-ES', { month: 'long' })} {selectedPeriodo.anio}</strong>?
                        </p>
                        <span className={styles.disclaimer}>Esta acción bloqueará nuevos registros contables en este mes.</span>
                        
                        <div className={styles.modalActions}>
                            <button 
                                className={styles.cancelBtn} 
                                onClick={() => setIsModalOpen(false)}
                                disabled={isProcessing}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={styles.confirmBtn} 
                                onClick={confirmCierre}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Cerrando...' : 'Sí, Cerrar Mes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}