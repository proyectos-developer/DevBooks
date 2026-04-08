const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isContador } = require('../authmiddleware');
const { default: axios } = require('axios');

router.get('/resumenes', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    const id_empresa = req.user.id_empresa;

    try {
        // 1. Pendientes de Conciliación (Tabla 11)
        const bancos = await pool.query(
            `SELECT COUNT(*) as pendientes, SUM(ABS(monto)) as monto_total 
             FROM banco_movimientos 
             WHERE estado_conciliacion = 0 AND id_cuenta_bancaria IN 
             (SELECT id FROM cuentas_bancarias WHERE id_empresa = ?)`,
            [id_empresa]
        );

        // 2. Discrepancias SIRE (Tablas 12 y 13)
        // Buscamos registros en SIRE que no tienen id_asiento_detalle vinculado
        const sireVentas = await pool.query(
            'SELECT COUNT(*) as cant FROM sire_propuesta_ventas WHERE id_empresa = ? AND id_asiento_detalle IS NULL',
            [id_empresa]
        );
        const sireCompras = await pool.query(
            'SELECT COUNT(*) as cant FROM sire_propuesta_compras WHERE id_empresa = ? AND id_asiento_detalle IS NULL',
            [id_empresa]
        );

        // 3. Resumen de Asientos del mes actual (Tabla 8)
        const asientosMes = await pool.query(
            `SELECT COUNT(*) as cant FROM asientos_cabecera 
             WHERE id_empresa = ? AND MONTH(fecha_asiento) = MONTH(CURRENT_DATE())`,
            [id_empresa]
        );

        return res.json({
            success: true,
            data: {
                bancosPendientes: bancos[0].pendientes || 0,
                bancosMonto: bancos[0].monto_total || 0,
                sirePendiente: (sireVentas[0].cant + sireCompras[0].cant),
                asientosMes: asientosMes[0].cant
            }
        });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al obtener métricas contables' });
    }
});

router.get('/libro-diario', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    const id_empresa = req.user.id_empresa; // Extraído del middleware de autenticación
    const { mes, anio } = req.query;

    try {
        // Consulta base: Traemos cabecera y calculamos el total del asiento
        let sql = `
            SELECT 
                ac.id, 
                ac.glosa, 
                ac.fecha_asiento, 
                ac.tipo_libro, 
                ac.moneda,
                p.mes,
                p.anio,
                (SELECT SUM(debe) FROM asientos_detalle WHERE id_asiento = ac.id) as total
            FROM asientos_cabecera ac
            JOIN periodos p ON ac.id_periodo = p.id
            WHERE ac.id_empresa = ?
        `;

        const params = [id_empresa];

        // Aplicar filtros de periodo si vienen en la URL (?mes=4&anio=2026)
        if (mes && anio) {
            sql += ` AND p.mes = ? AND p.anio = ?`;
            params.push(parseInt(mes), parseInt(anio));
        }

        // Ordenar por fecha más reciente
        sql += ` ORDER BY ac.fecha_asiento DESC, ac.id DESC`;

        const rows = await pool.query(sql, params);

        return res.json({
            success: true,
            data: rows,
            count: rows.length,
            periodo_consultado: mes && anio ? `${mes}-${anio}` : 'Todos'
        });

    } catch (error) {
        console.error('Error en Libro Diario Contador:', error);
        return res.json({
            success: false,
            mensaje: 'Error al procesar la solicitud contable'
        });
    }
});

// Endpoint: GET /apimovil/admin/asiento-detalle/:id
router.get('/asiento-detalle/:id', async (req, res) => {
    const { id } = req.params; // ID de asientos_cabecera
    const id_empresa = req.user.id_empresa; // Filtro de seguridad multi-tenant

    try {
        // 1. Consultar la Cabecera (Tabla 8)
        const cabecera = await pool.query(
            `SELECT ac.*, p.anio, p.mes 
             FROM asientos_cabecera ac
             JOIN periodos p ON ac.id_periodo = p.id
             WHERE ac.id = ? AND ac.id_empresa = ?`,
            [id, id_empresa]
        );

        if (cabecera.length === 0) {
            return res.json({ success: false, mensaje: "Asiento no encontrado" });
        }

        // 2. Consultar el Detalle con Plan Contable y Entidades (Tablas 9, 4 y 7)
        const movimientos = await pool.query(
            `SELECT 
                ad.id,
                ad.debe,
                ad.haber,
                ad.serie_comprobante,
                ad.numero_comprobante,
                pc.codigo AS cuenta_codigo,
                pc.descripcion AS cuenta_nombre,
                ent.nombre_razon_social AS entidad_nombre
             FROM asientos_detalle ad
             JOIN plan_contable pc ON ad.id_cuenta = pc.id
             LEFT JOIN entidades ent ON ad.id_entidad = ent.id
             WHERE ad.id_asiento = ?
             ORDER BY ad.debe DESC`, // Convención: cuentas del Debe primero
            [id]
        );

        return res.json({
            success: true,
            data: {
                cabecera: cabecera[0],
                movimientos: movimientos
            }
        });
    } catch (error) {
        return res.json({ success: false, mensaje: "Error en el servidor" });
    }
});

const https = require('https'); // Importa el módulo nativo https

// --- Función Auxiliar para obtener TC ---
const getTipoCambioSunat = async (fecha) => {
    try {
        const response = await axios.get(`https://api.apiperu.com/v1/tipo-cambio-sunat?fecha=${fecha}`, {
            headers: { 'Authorization': 'Bearer TU_TOKEN' },
            // Configuración Crítica para solucionar EPROTO / Alerta 112
            httpsAgent: new https.Agent({
                servername: 'api.apisperu.com', // Fuerza el envío del SNI correcto
                rejectUnauthorized: true       // Mantiene la validación de certificados por seguridad
            }),
            timeout: 8000 
        });
        
        return {
            compra: response.data.compra,
            venta: response.data.venta,
            fecha: response.data.fecha,
            success: true
        };
    } catch (error) {
        // Imprime el error específico para depuración
        console.error("Error en Handshake SSL:", error.message);
        return { success: false, error: error.code };
    }
};

// --- Endpoint: GET /tipo-cambio ---
router.get('/tipo-cambio', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    // Si no se envía fecha, usamos la fecha actual del servidor (YYYY-MM-DD)
    const fechaQuery = req.query.fecha || new Date().toISOString().split('T')[0];

    try {
        const tcData = await getTipoCambioSunat(fechaQuery);

        if (!tcData) {
            return res.json({ 
                success: false, 
                mensaje: 'No se pudo obtener el tipo de cambio para la fecha indicada' 
            });
        }

        return res.json({
            success: true,
            data: tcData
        });
    } catch (error) {
        console.log (error)
        return res.json({ success: false, mensaje: 'Error interno al procesar TC' });
    }
});

module.exports = router;