const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isCliente } = require('../authmiddleware');

// Ruta: /api/cliente/mis-reportes/:id_periodo
router.get('/mis-reportes/:id_periodo', passport.authenticate('jwt', { session: false }), isCliente, async (req, res) => {
    try {
        const { id_periodo } = req.params;
        const id_empresa = req.user.id_empresa;

        // 1. Obtener totales de ventas del periodo
        const ventas = await pool.query(
            "SELECT SUM(monto_base) as base, SUM(monto_igv) as igv, SUM(monto_total) as total FROM sire_propuesta_ventas WHERE id_empresa = ? AND id_periodo = ?",
            [id_empresa, id_periodo]
        );

        // 2. Obtener totales de compras del periodo
        const compras = await pool.query(
            "SELECT SUM(monto_base_gravada) as base, SUM(monto_igv) as igv, SUM(monto_total) as total FROM sire_propuesta_compras WHERE id_empresa = ? AND id_periodo = ?",
            [id_empresa, id_periodo]
        );

        // 3. Información del periodo
        const periodo = await pool.query("SELECT * FROM periodos WHERE id = ?", [id_periodo]);

        return res.json({
            success: true,
            reporte: {
                periodo: periodo[0],
                ventas: ventas[0] || { base: 0, igv: 0, total: 0 },
                compras: compras[0] || { base: 0, igv: 0, total: 0 },
                impuesto_estimado: (ventas[0]?.igv || 0) - (compras[0]?.igv || 0)
            }
        });
    } catch (error) {
        return res.json({ success: false });
    }
});

module.exports = router;