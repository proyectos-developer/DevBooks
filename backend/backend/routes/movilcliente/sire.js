const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isCliente } = require('../authmiddleware');

// GET /apimovil/cliente/reportes/sire
router.get('/reportes/sire', passport.authenticate('jwt', { session: false }), isCliente, async (req, res) => {
    const id_empresa = req.user.id_empresa;
    const { anio } = req.query; // Ejemplo: 2026

    try {
        const reportes = await pool.query(
            `SELECT 
                p.id,
                p.mes, 
                p.anio,
                p.cerrado,
                COALESCE(SUM(v.monto_total), 0) as total_ventas,
                COALESCE(SUM(v.monto_igv), 0) as igv_ventas,
                COALESCE(SUM(c.monto_total), 0) as total_compras,
                COALESCE(SUM(c.monto_igv), 0) as igv_compras
             FROM periodos p
             LEFT JOIN sire_propuesta_ventas v ON p.id = v.id_periodo AND v.id_empresa = p.id_empresa
             LEFT JOIN sire_propuesta_compras c ON p.id = c.id_periodo AND c.id_empresa = p.id_empresa
             WHERE p.id_empresa = ? AND p.anio = ?
             GROUP BY p.id
             ORDER BY p.mes DESC`,
            [id_empresa, anio]
        );

        return res.json({ success: true, data: reportes });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al generar reportes' });
    }
});

router.get('/reporte/detalles/:id_periodo', passport.authenticate('jwt', { session: false }), isCliente, async (req, res) => {
    const { id_periodo } = req.params;
    const id_empresa = req.user.id_empresa;

    try {
        const detalle = await pool.query(
            `SELECT 
                (SELECT SUM(monto_total) FROM sire_propuesta_ventas WHERE id_periodo = ? AND id_empresa = ?) as total_ventas,
                (SELECT SUM(monto_total) FROM sire_propuesta_compras WHERE id_periodo = ? AND id_empresa = ?) as total_compras,
                (SELECT COUNT(*) FROM sire_propuesta_ventas WHERE id_periodo = ? AND id_empresa = ?) as cant_ventas,
                (SELECT COUNT(*) FROM sire_propuesta_compras WHERE id_periodo = ? AND id_empresa = ?) as cant_compras`,
            [id_periodo, id_empresa, id_periodo, id_empresa, id_periodo, id_empresa, id_periodo, id_empresa]
        );

        return res.json({ success: true, data: detalle[0] });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al obtener detalle' });
    }
});

module.exports = router;