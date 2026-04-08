const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isContador } = require('../authmiddleware');

// Endpoint: GET /apimovil/contador/entidades
router.get('/entidades', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    const id_empresa = req.user.id_empresa;
    const { search } = req.query;

    try {
        let sql = 'SELECT id, tipo_documento, numero_documento, nombre_razon_social FROM entidades WHERE id_empresa = ?';
        const params = [id_empresa];

        if (search) {
            sql += ' AND (numero_documento LIKE ? OR nombre_razon_social LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY nombre_razon_social ASC';
        const rows = await pool.query(sql, params);

        return res.json({ success: true, data: rows });
    } catch (error) {
        console.log (error)
        return res.json({ success: false, mensaje: 'Error al obtener entidades' });
    }
});

router.get('/entidad/:id', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    const { id } = req.params;
    const id_empresa = req.user.id_empresa;

    try {
        const rows = await pool.query(
            'SELECT * FROM entidades WHERE id = ? AND id_empresa = ?',
            [id, id_empresa]
        );

        if (rows.length === 0) {
            return res.json({ success: false, mensaje: 'Entidad no encontrada' });
        }

        return res.json({ success: true, data: rows[0] });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al obtener detalle' });
    }
});

router.get('/entidad/:id/movimientos', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    const { id } = req.params;
    const id_empresa = req.user.id_empresa;

    try {
        const rows = await pool.query(
            `SELECT 
                ad.debe, 
                ad.haber, 
                ad.serie_comprobante, 
                ad.numero_comprobante,
                ac.fecha_asiento, 
                ac.glosa,
                ac.id as id_asiento
             FROM asientos_detalle ad
             JOIN asientos_cabecera ac ON ad.id_asiento = ac.id
             WHERE ad.id_entidad = ? AND ac.id_empresa = ?
             ORDER BY ac.fecha_asiento DESC`,
            [id, id_empresa]
        );

        return res.json({ success: true, data: rows });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al obtener historial' });
    }
});

module.exports = router;