const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isAdmin } = require('../authmiddleware');

// routes/admin.js
router.get('/configuracion', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        // Supongamos que tienes una tabla 'configuracion_global'
        const config = await pool.query('SELECT * FROM configuracion_global WHERE id = 1');
        return res.json({ success: true, config: config[0] });
    } catch (error) {
        return res.json({ success: false });
    }
});

router.post('/configuracion', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const { igv_actual, moneda_defecto, smtp_host, smtp_user } = req.body;
    try {
        await pool.query(
            'UPDATE configuracion_global SET igv_actual=?, moneda_defecto=?, smtp_host=?, smtp_user=? WHERE id = 1',
            [igv_actual, moneda_defecto, smtp_host, smtp_user]
        );
        return res.json({ success: true, mensaje: 'Configuración actualizada' });
    } catch (error) {
        return res.json({ success: false });
    }
});

module.exports = router;