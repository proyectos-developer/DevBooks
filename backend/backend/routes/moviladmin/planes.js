const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isAdmin } = require('../authmiddleware');

// Obtener el Plan de Cuentas de la empresa
router.get('/listar-cuentas', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const id_empresa = req.user.id_empresa; // Extraído del JWT
    try {
        const rows = await pool.query(
            `SELECT id, codigo, descripcion, nivel, permite_movimiento 
             FROM plan_contable 
             WHERE id_empresa = ? 
             ORDER BY codigo ASC`, 
            [id_empresa]
        );
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, mensaje: 'Error al obtener el PCGE' });
    }
});

module.exports = router;