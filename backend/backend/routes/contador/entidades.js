const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isContador } = require('../authmiddleware');

// routes/contador.js
router.get('/entidades', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const id_empresa = req.user.id_empresa;
        
        const rows = await pool.query(
            `SELECT id, tipo_documento, numero_documento, nombre_razon_social, 
                    tipo_entidad, telefono, email 
             FROM entidades 
             WHERE id_empresa = ? 
             ORDER BY nombre_razon_social ASC`,
            [id_empresa]
        );

        return res.json({ success: true, entidades: rows });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al obtener el maestro de entidades' });
    }
});

// routes/contador.js

// 1. Obtener datos actuales para el formulario
router.get('/entidad/:id', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await pool.query(
            "SELECT * FROM entidades WHERE id = ? AND id_empresa = ?",
            [id, req.user.id_empresa]
        );
        if (rows.length === 0) return res.json({ success: false });
        return res.json({ success: true, entidad: rows[0] });
    } catch (error) {
        return res.json({ success: false });
    }
});

// 2. Procesar la actualización
router.post('/entidad/:id', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const { id } = req.params;
        const {  nombre_razon_social,  tipo_documento,  direccion,  es_cliente,  es_proveedor  } = req.body;

        // Validamos que id_empresa venga del token para seguridad Multi-tenant
        const id_empresa = req.user.id_empresa;

        /**
         * Actualizamos según la estructura de la tabla:
         * tipo_documento (CHAR 1), es_cliente (TINYINT), es_proveedor (TINYINT)
         */
        const result = await pool.query(
            `UPDATE entidades 
             SET nombre_razon_social = ?, 
                 tipo_documento = ?, 
                 direccion = ?, 
                 es_cliente = ?, 
                 es_proveedor = ?
             WHERE id = ? AND id_empresa = ?`,
            [
                nombre_razon_social.toUpperCase(), // Normalizamos a mayúsculas
                tipo_documento, 
                direccion, 
                es_cliente ? 1 : 0, // Aseguramos formato TINYINT
                es_proveedor ? 1 : 0, 
                id, 
                id_empresa
            ]
        );

        if (result.affectedRows === 0) {
            return res.json({ 
                success: false, 
                mensaje: 'No se encontró la entidad o no tienes permisos.' 
            });
        }

        return res.json({ 
            success: true, 
            mensaje: 'Entidad actualizada correctamente' 
        });

    } catch (error) {
        console.error("Error en Update Entidad:", error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.json({ 
                success: false, 
                mensaje: 'Ya existe una entidad con ese número de documento.' 
            });
        }

        return res.json({ 
            success: false, 
            mensaje: 'Error interno al actualizar la entidad' 
        });
    }
});

// routes/contador.js
router.get('/entidad-historial/:id', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const { id } = req.params;
        const id_empresa = req.user.id_empresa;

        // 1. Obtener info básica de la entidad
        const entidad = await pool.query(
            "SELECT nombre_razon_social, numero_documento FROM entidades WHERE id = ? AND id_empresa = ?",
            [id, id_empresa]
        );

        if (entidad.length === 0) return res.status(404).json({ success: false });

        // 2. Obtener todos los movimientos contables relacionados
        const movimientos = await pool.query(
            `SELECT ad.debe, ad.haber, ad.tipo_comprobante, ad.serie_comprobante, ad.numero_comprobante,
                    ac.fecha_asiento, ac.glosa, ac.id as id_asiento, pc.codigo as cuenta_codigo
             FROM asientos_detalle ad
             JOIN asientos_cabecera ac ON ad.id_asiento = ac.id
             JOIN plan_contable pc ON ad.id_cuenta = pc.id
             WHERE ad.id_entidad = ? AND ac.id_empresa = ?
             ORDER BY ac.fecha_asiento DESC`,
            [id, id_empresa]
        );

        return res.json({ success: true, entidad: entidad[0], movimientos });
    } catch (error) {
        return res.json({ success: false });
    }
});

module.exports = router;