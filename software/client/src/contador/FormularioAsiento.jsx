import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../redux/axios_auth.js';
import styles from './FormularioAsiento.module.css';
import { constantes } from '../uri/constantes.js';

export default function FormularioAsiento() {
    
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [periodos, setPeriodos] = useState([]);
    const [entidades, setEntidades] = useState([]);
    const [cuentas, setCuentas] = useState([]); 

    const [cabecera, setCabecera] = useState({
        id_periodo: '',
        glosa: '',
        fecha_asiento: '',
        tipo_libro: 'DIARIO',
        moneda: 'PEN'
    });

    const [filas, setFilas] = useState([
        { id_cuenta: null, codigo_busqueda: '', descripcion_cuenta: '', debe: 0, haber: 0, id_entidad: '', tipo_comprobante: '', serie: '', numero: '' },
        { id_cuenta: null, codigo_busqueda: '', descripcion_cuenta: '', debe: 0, haber: 0, id_entidad: '', tipo_comprobante: '', serie: '', numero: '' }
    ]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const url = constantes().url_principal[0].url;
                const [resP, resE, resC] = await Promise.all([
                    api.get(`${url}/api/contador/periodos-abiertos`),
                    api.get(`${url}/api/contador/entidades`),
                    api.get(`${url}/api/contador/plan-contable`)
                ]);
                
                if (resP.data.success) setPeriodos(resP.data.periodos);
                if (resE.data.success) setEntidades(resE.data.entidades);
                if (resC.data.success) setCuentas(resC.data.cuentas);
            } catch (err) {
                console.error("Error al cargar datos maestros del sistema contable");
            }
        };
        loadData();
    }, []);

    const agregarFila = () => {
        setFilas([...filas, { 
            id_cuenta: null, 
            codigo_busqueda: '', 
            descripcion_cuenta: '',
            debe: 0, 
            haber: 0, 
            id_entidad: '', 
            tipo_comprobante: '', 
            serie: '', 
            numero: '' 
        }]);
    };

    const eliminarFila = (index) => {
        if (filas.length > 2) {
            setFilas(filas.filter((_, i) => i !== index));
        }
    };

    const actualizarFila = (index, campo, valor) => {
        const nuevasFilas = [...filas];
        
        if (campo === 'id_cuenta') {
            // 'valor' es lo que el usuario escribe en el input de código
            nuevasFilas[index]['codigo_busqueda'] = valor;
            const cuentaEncontrada = cuentas.find(c => c.codigo === valor);
            
            if (cuentaEncontrada) {
                nuevasFilas[index]['id_cuenta'] = cuentaEncontrada.id;
                nuevasFilas[index]['descripcion_cuenta'] = cuentaEncontrada.descripcion;
            } else {
                nuevasFilas[index]['id_cuenta'] = null;
                nuevasFilas[index]['descripcion_cuenta'] = '';
            }
        } else {
            nuevasFilas[index][campo] = valor;
        }
        
        setFilas(nuevasFilas);
    };

    const totalDebe = filas.reduce((acc, f) => acc + Number(f.debe || 0), 0);
    const totalHaber = filas.reduce((acc, f) => acc + Number(f.haber || 0), 0);
    const diferencia = Math.abs(totalDebe - totalHaber);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const tieneFilasSinCuenta = filas.some(f => f.id_cuenta === null);
        if (tieneFilasSinCuenta) {
            return alert("Por favor, seleccione una cuenta contable válida del listado para todas las filas.");
        }

        if (diferencia.toFixed(2) !== "0.00" || totalDebe === 0) {
            return alert("El asiento no cumple con la partida doble.");
        }

        setLoading(true);

        const detallesFinales = filas.map(f => ({
            id_cuenta: f.id_cuenta,
            debe: f.debe || 0,
            haber: f.haber || 0,
            id_entidad: f.id_entidad || null, // Convertir string vacío a null
            // Si el tipo es '0' o vacío, lo mandamos como null para que no falle la FK
            tipo_comprobante: (f.tipo_comprobante && f.tipo_comprobante !== '0') ? f.tipo_comprobante : null,
            serie_comprobante: f.serie || null,
            numero_comprobante: f.numero || null
        }));

        const payload = {
            ...cabecera,
            detalles: detallesFinales
        };

        try {
            const res = await api.post(`${constantes().url_principal[0].url}/api/contador/asiento`, payload);
            if (res.data.success) setShowModal(true);
        } catch (err) {
            alert(err.response?.data?.mensaje || "Error de llave foránea: Verifique los códigos de comprobante");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.topHeader}>
                    <h2 className={styles.title}>Nuevo Registro Contable</h2>
                    <div className={`${styles.balanceBadge} ${diferencia === 0 ? styles.success : styles.error}`}>
                        {diferencia === 0 ? '✓ Cuadrado' : `⚠️ Diferencia: ${diferencia.toFixed(2)}`}
                    </div>
                </div>

                <div className={styles.headerGrid}>
                    <div className={styles.inputGroup}>
                        <label>📅 Fecha</label>
                        <input type="date" required className={styles.mainInput} onChange={e => setCabecera({...cabecera, fecha_asiento: e.target.value})} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>🗓️ Periodo</label>
                        <select required className={styles.mainInput} onChange={e => setCabecera({...cabecera, id_periodo: e.target.value})}>
                            <option value="">Seleccione...</option>
                            {periodos.map(p => <option key={p.id} value={p.id}>{p.mes}/{p.anio}</option>)}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>📘 Libro</label>
                        <select className={styles.mainInput} value={cabecera.tipo_libro} onChange={e => setCabecera({...cabecera, tipo_libro: e.target.value})}>
                            <option value="DIARIO">DIARIO</option>
                            <option value="VENTAS">VENTAS</option>
                            <option value="COMPRAS">COMPRAS</option>
                            <option value="CAJA">CAJA/BANCOS</option>
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>💰 Moneda</label>
                        <select className={styles.mainInput} value={cabecera.moneda} onChange={e => setCabecera({...cabecera, moneda: e.target.value})}>
                            <option value="PEN">Soles (S/.)</option>
                            <option value="USD">Dólares ($)</option>
                        </select>
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label>✍️ Glosa / Descripción</label>
                        <input type="text" required placeholder="Descripción de la operación..." className={styles.mainInput} onChange={e => setCabecera({...cabecera, glosa: e.target.value})} />
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Cuenta</th>
                                <th>Debe</th>
                                <th>Haber</th>
                                <th>Entidad (RUC/Nombre)</th>
                                <th>Tipo</th>
                                <th>Serie</th>
                                <th>Número</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filas.map((fila, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className={styles.cuentaContainer}>
                                            <input 
                                                type="text" 
                                                placeholder="Código" 
                                                required 
                                                list="cuentas-list"
                                                value={fila.codigo_busqueda}
                                                className={styles.tableInput} 
                                                onChange={e => actualizarFila(index, 'id_cuenta', e.target.value)} 
                                            />
                                            <span className={styles.cuentaNombre}>{fila.descripcion_cuenta}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <input type="number" step="0.01" className={styles.tableInput} 
                                               onChange={e => actualizarFila(index, 'debe', e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" step="0.01" className={styles.tableInput} 
                                               onChange={e => actualizarFila(index, 'haber', e.target.value)} />
                                    </td>
                                    <td>
                                        <select className={styles.tableInput} onChange={e => actualizarFila(index, 'id_entidad', e.target.value)}>
                                            <option value="">- Seleccione -</option>
                                            {entidades.map(ent => (
                                                <option key={ent.id} value={ent.id}>{ent.numero_documento} | {ent.nombre_razon_social}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td><input type="text" placeholder="01" className={styles.tableInput} onChange={e => actualizarFila(index, 'tipo_comprobante', e.target.value)} /></td>
                                    <td><input type="text" placeholder="F001" className={styles.tableInput} onChange={e => actualizarFila(index, 'serie', e.target.value)} /></td>
                                    <td><input type="text" placeholder="123" className={styles.tableInput} onChange={e => actualizarFila(index, 'numero', e.target.value)} /></td>
                                    <td><button type="button" className={styles.deleteBtn} onClick={() => eliminarFila(index)}>✕</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <datalist id="cuentas-list">
                    {cuentas.map(c => (
                        <option key={c.id} value={c.codigo}>{c.descripcion}</option>
                    ))}
                </datalist>

                <div className={styles.footer}>
                    <button type="button" className={styles.addBtn} onClick={agregarFila}>+ Añadir Línea</button>
                    <button type="submit" className={styles.saveBtn} disabled={loading}>
                        {loading ? 'Guardando...' : '💾 Guardar Asiento'}
                    </button>
                </div>
            </form>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.successIcon}>✓</div>
                        <h3>Registro Exitoso</h3>
                        <p>El asiento se ha guardado correctamente.</p>
                        <button onClick={() => navigate('/contador/asientos')} className={styles.modalBtn}>Aceptar</button>
                    </div>
                </div>
            )}
        </div>
    );
}