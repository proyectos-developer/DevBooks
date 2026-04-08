const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isContador } = require('../authmiddleware');

// routes/contador.js
router.post('/asiento', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    const { id_periodo, fecha_asiento, glosa, tipo_libro, moneda, detalles } = req.body;

    try {
        // 1. Insertar Cabecera
        const cabecera = await pool.query(
            `INSERT INTO asientos_cabecera (id_empresa, id_periodo, id_usuario, fecha_asiento, glosa, tipo_libro, moneda) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id_empresa, id_periodo, req.user.id, fecha_asiento, glosa, tipo_libro, moneda]
        );

        const id_asiento = cabecera.insertId;

        // 2. Insertar Detalles (Array de movimientos)
        const detalleValues = detalles.map(d => [
            id_asiento, d.id_cuenta, d.debe, d.haber, d.id_entidad, d.tipo_comprobante, d.serie, d.numero
        ]);

        await pool.query(
            `INSERT INTO asientos_detalle (id_asiento, id_cuenta, debe, haber, id_entidad, tipo_comprobante, serie_comprobante, numero_comprobante) 
             VALUES ?`,
            [detalleValues]
        );

        return res.json({ success: true, mensaje: 'Asiento contable registrado' });
    } catch (error) {
        console.log (error)
        return res.json({ success: false, mensaje: 'Error al registrar asiento' });
    } 
});

// routes/contador.js
router.get('/asientos', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const id_empresa = req.user.id_empresa;
        
        const rows = await pool.query(
            `SELECT ac.id, ac.fecha_asiento, ac.glosa, ac.tipo_libro, ac.moneda, 
                    p.mes, p.anio, u.nombre as usuario_registro
             FROM asientos_cabecera ac
             JOIN periodos p ON ac.id_periodo = p.id
             JOIN usuarios u ON ac.id_usuario = u.id
             WHERE ac.id_empresa = ?
             ORDER BY ac.fecha_asiento DESC, ac.created_at DESC`,
            [id_empresa]
        );

        return res.json({ success: true, asientos: rows });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al obtener el libro diario' });
    }
});

// routes/contador.js
router.get('/asiento-detalle/:id', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const { id } = req.params;
        const id_empresa = req.user.id_empresa;

        // 1. Obtener Cabecera
        const cabecera = await pool.query(
            `SELECT ac.*, p.mes, p.anio, u.nombre as usuario 
             FROM asientos_cabecera ac
             JOIN periodos p ON ac.id_periodo = p.id
             JOIN usuarios u ON ac.id_usuario = u.id
             WHERE ac.id = ? AND ac.id_empresa = ?`,
            [id, id_empresa]
        );

        if (cabecera.length === 0) return res.json({ success: false, mensaje: 'Asiento no encontrado' });

        // 2. Obtener Detalles (Movimientos)
        const detalles = await pool.query(
            `SELECT ad.*, pc.codigo, pc.descripcion as cuenta_nombre, ent.nombre_razon_social as entidad_nombre
             FROM asientos_detalle ad
             JOIN plan_contable pc ON ad.id_cuenta = pc.id
             LEFT JOIN entidades ent ON ad.id_entidad = ent.id
             WHERE ad.id_asiento = ?`,
            [id]
        );

        return res.json({ success: true, cabecera: cabecera[0], detalles });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al obtener detalle' });
    }
});

module.exports = router;