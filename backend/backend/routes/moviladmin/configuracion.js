const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isAdmin } = require('../authmiddleware');

// Obtener datos actuales de la empresa
router.get('/config', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const id_empresa = req.user.id_empresa;
    try {
        const rows = await pool.query(
            'SELECT ruc, razon_social, nombre_comercial, direccion, estado_sunat FROM empresas WHERE id = ?',
            [id_empresa]
        );
        return res.json({ success: true, data: rows[0] });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al obtener datos' });
    }
});

// Actualizar datos de la empresa
router.post('/config', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const id_empresa = req.user.id_empresa;
    const { razon_social, nombre_comercial, direccion } = req.body;

    try {
        await pool.query(
            'UPDATE empresas SET razon_social = ?, nombre_comercial = ?, direccion = ? WHERE id = ?',
            [razon_social, nombre_comercial, direccion, id_empresa]
        );
        return res.json({ success: true, mensaje: 'Configuración actualizada correctamente' });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al actualizar' });
    }
});

module.exports = router;