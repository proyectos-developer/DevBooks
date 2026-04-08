const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isContador } = require('../authmiddleware');

// routes/contador.js
router.get('/plan-contable-full', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const id_empresa = req.user.id_empresa;
        const rows = await pool.query(
            `SELECT id, codigo, descripcion, nivel, tipo_cuenta, permite_movimiento 
             FROM plan_contable 
             WHERE id_empresa = ? 
             ORDER BY codigo ASC`,
            [id_empresa]
        );
        return res.json({ success: true, cuentas: rows });
    } catch (error) {
        return res.json({ success: false });
    }
});

// routes/contador.js
router.get('/balance-comprobacion/:id_periodo', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const { id_periodo } = req.params;
        const id_empresa = req.user.id_empresa;

        const query = `
            SELECT 
                pc.codigo, 
                pc.descripcion,
                SUM(ad.debe) AS suma_debe,
                SUM(ad.haber) AS suma_haber,
                (SUM(ad.debe) - SUM(ad.haber)) AS saldo_deudor,
                (SUM(ad.haber) - SUM(ad.debe)) AS saldo_acreedor
            FROM asientos_detalle ad
            JOIN asientos_cabecera ac ON ad.id_asiento = ac.id
            JOIN plan_contable pc ON ad.id_cuenta = pc.id
            WHERE ac.id_empresa = ? AND ac.id_periodo = ?
            GROUP BY pc.id
            ORDER BY pc.codigo ASC
        `;

        const balance = await pool.query(query, [id_empresa, id_periodo]);
        return res.json({ success: true, data: balance });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al calcular balance' });
    }
});

module.exports = router;