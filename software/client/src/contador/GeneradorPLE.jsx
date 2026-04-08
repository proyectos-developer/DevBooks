import React, { useState, useEffect } from 'react';
import api from '../redux/axios_auth.js';
import styles from './GeneradorPLE.module.css';
import { constantes } from '../uri/constantes.js';

export default function GeneradorPLE() {
    
    const [periodos, setPeriodos] = useState([]);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`${constantes().url_principal[0].url}/api/contador/periodos-all`)
           .then(res => setPeriodos(res.data.periodos))
           .catch(() => setError('Error al conectar con el servidor'));
    }, []);

    const handleSelectChange = (e) => {
        const p = periodos.find(item => item.id === parseInt(e.target.value));
        setPeriodoSeleccionado(p);
        setError('');
    };

    const generarArchivo = async () => {
        if (!periodoSeleccionado) return;
        setLoading(true);
        setError('');

        try {
            const res = await api.get(`${constantes().url_principal[0].url}/api/contador/generar-ple-diario/${periodoSeleccionado.id}`);
            
            if (res.data.success) {
                const blob = new Blob([res.data.txt], { type: 'text/plain;charset=utf-8' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', res.data.nombreArchivo);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            } else {
                setError(res.data.mensaje);
            }
        } catch (err) {
            setError('Error al generar el archivo. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.pleIcon}>SUNAT</span>
                    <h2>Libros Electrónicos 5.1</h2>
                    <p>Generación de archivo TXT para el validador PLE.</p>
                </div>

                <div className={styles.body}>
                    <label className={styles.label}>Periodo Contable</label>
                    <select className={styles.select} onChange={handleSelectChange}>
                        <option value="">-- Seleccionar Mes --</option>
                        {periodos.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.mes}/{p.anio} {p.cerrado ? '(Cerrado)' : '(Abierto)'}
                            </option>
                        ))}
                    </select>

                    {periodoSeleccionado && !periodoSeleccionado.cerrado && (
                        <div className={styles.warningBox}>
                            ⚠️ El periodo seleccionado está <strong>ABIERTO</strong>. SUNAT recomienda generar el PLE solo después del cierre mensual.
                        </div>
                    )}

                    {error && <div className={styles.errorBox}>{error}</div>}
                </div>

                <button 
                    className={styles.mainBtn}
                    onClick={generarArchivo}
                    disabled={loading || !periodoSeleccionado}
                >
                    {loading ? 'Procesando Data...' : 'Descargar Libro Diario'}
                </button>
            </div>
        </div>
    );
}