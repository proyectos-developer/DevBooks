const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isCliente } = require('../authmiddleware');

// router.get('/mis-comprobantes/:id_periodo', ...
router.get('/mis-comprobantes/:id_periodo', passport.authenticate('jwt', { session: false }), isCliente, async (req, res) => {
    try {
        const { id_periodo } = req.params;
        const id_empresa = req.user.id_empresa;

        // Obtener los documentos de la propuesta de ventas de SUNAT
        const comprobantes = await pool.query(
            `SELECT serie, numero, fecha_emision, monto_base, monto_igv, monto_total, estado_sire 
             FROM sire_propuesta_ventas 
             WHERE id_empresa = ? AND id_periodo = ? 
             ORDER BY fecha_emision DESC`,
            [id_empresa, id_periodo]
        );

        return res.json({ success: true, comprobantes });
    } catch (error) {
        console.error("Error al obtener comprobantes:", error);
        return res.json({ success: false });
    }
});

module.exports = router;