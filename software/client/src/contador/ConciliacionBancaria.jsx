import React, { useState, useEffect } from 'react';
import api from '../redux/axios_auth.js';
import styles from './ConciliacionBancaria.module.css';
import { constantes } from '../uri/constantes.js';
import { bancoscontadordata } from '../redux/contador/bancoscontadordata.js'
import { bancoscontadorConstants } from '../uri/contador/bancoscontador-constants.js'
import { useDispatch, useSelector } from 'react-redux';

export default function ConciliacionBancaria() {

    const dispatch = useDispatch();

    const [cuentas, setCuentas] = useState([]); 
    const [idCtaBancaria, setIdCtaBancaria] = useState(''); 
    const [data, setData] = useState({ extracto: [], contabilidad: [] });
    
    const [selBanco, setSelBanco] = useState(null);
    const [selAsiento, setSelAsiento] = useState(null);
    const [loading, setLoading] = useState(true);

    const { get_conciliacion } = useSelector(({ bancoscontador_data }) => bancoscontador_data);
    
    useEffect(() => {
        const fetchCuentas = async () => {
            try {
                const res = await api.get(`${constantes().url_principal[0].url}/api/contador/cuentas-bancarias`);
                if (res.data.success) setCuentas(res.data.cuentas);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchCuentas();
    }, []);

    
    useEffect(() => {
        if (idCtaBancaria) {
            loadData();
        }
    }, [idCtaBancaria]);

    const loadData = () => {
        dispatch(bancoscontadordata(bancoscontadorConstants(idCtaBancaria, {}, false).get_conciliacion));
    };
    
    useEffect(() => {
        if (get_conciliacion) {
            setData({
                extracto: get_conciliacion.extracto || [],
                contabilidad: get_conciliacion.contabilidad || []
            });
        }
    }, [get_conciliacion]);

    const handleConciliar = async () => {
        if (!selBanco || !selAsiento) return;
        try {
            const res = await api.post(`${constantes().url_principal[0].url}/api/contador/conciliar-vincular`, {
                id_mov_banco: selBanco.id,
                id_asiento_detalle: selAsiento.id
            });
            if (res.data.success) {
                setSelBanco(null);
                setSelAsiento(null);
                loadData(); 
            }
        } catch (err) { alert("Error al vincular"); }
    };

    if (loading) return <div className={styles.loader}>Cargando panel de conciliación...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2>Conciliación Bancaria</h2>
                    <p className={styles.subtitle}>Empareja el extracto del banco con tus asientos contables.</p>
                </div>
                
                <div className={styles.controls}>
                    <select 
                        className={styles.selectCta} 
                        value={idCtaBancaria}
                        onChange={(e) => setIdCtaBancaria(e.target.value)}
                    >
                        <option value="">-- Seleccionar Cuenta --</option>
                        {cuentas.map(c => (
                            <option key={c.id} value={c.id}>{c.banco} - {c.numero_cuenta} ({c.moneda})</option>
                        ))}
                    </select>

                    <button 
                        className={styles.actionBtn} 
                        disabled={!selBanco || !selAsiento}
                        onClick={handleConciliar}
                    >
                        Vincular Selección
                    </button>
                </div>
            </div>

            {!idCtaBancaria ? (
                <div className={styles.emptyState}>Seleccione una cuenta bancaria para comenzar.</div>
            ) : (
                <div className={styles.workArea}>
                    {/* PANEL BANCO */}
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>Extracto Bancario (Pendiente)</div>
                        <div className={styles.scrollList}>
                            {data.extracto.map(mov => (
                                <div 
                                    key={mov.id} 
                                    className={`${styles.card} ${selBanco?.id === mov.id ? styles.selected : ''}`}
                                    onClick={() => setSelBanco(mov)}
                                >
                                    <span className={styles.date}>{new Date(mov.fecha_operacion).toLocaleDateString()}</span>
                                    <p className={styles.desc}>{mov.descripcion_banco}</p>
                                    <strong className={mov.monto > 0 ? styles.ingreso : styles.egreso}>
                                        S/ {Math.abs(mov.monto).toFixed(2)}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.centerDivider}>
                        <div className={styles.linkLine}></div>
                        <span>{selBanco && selAsiento ? '🔗' : 'vs'}</span>
                    </div>

                    {/* PANEL CONTABILIDAD */}
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>Libro Mayor (Sin Conciliar)</div>
                        <div className={styles.scrollList}>
                            {data.contabilidad.map(as => (
                                <div 
                                    key={as.id} 
                                    className={`${styles.card} ${selAsiento?.id === as.id ? styles.selected : ''}`}
                                    onClick={() => setSelAsiento(as)}
                                >
                                    <span className={styles.date}>{new Date(as.fecha_asiento).toLocaleDateString()}</span>
                                    <p className={styles.desc}>{as.glosa}</p>
                                    <strong className={as.debe > 0 ? styles.ingreso : styles.egreso}>
                                        S/ {as.debe > 0 ? Number(as.debe).toFixed(2) : Number(as.haber).toFixed(2)}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}