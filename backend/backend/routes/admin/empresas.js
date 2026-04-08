const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isAdmin } = require('../authmiddleware');

// routes/admin.js
router.get('/empresas', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const query = `
            SELECT id, ruc, razon_social, nombre_comercial, estado_sunat, created_at 
            FROM empresas 
            ORDER BY created_at DESC
        `;
        
        const rows = await pool.query(query);

        return res.json({
            success: true,
            empresas: rows
        });
    } catch (error) {
        console.error('Error al listar empresas:', error);
        return res.json({ success: false, mensaje: 'Error en el servidor.' });
    }
});

// Obtener datos de una empresa específica
router.get('/empresa/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const rows = await pool.query('SELECT * FROM empresas WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.json({ mensaje: 'Empresa no encontrada' });
        return res.json({ success: true, empresa: rows[0] });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al obtener empresa' });
    }
});

// Actualizar empresa
router.post('/empresa/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const { razon_social, nombre_comercial, direccion, estado_sunat } = req.body;
    try {
        await pool.query(
            'UPDATE empresas SET razon_social=?, nombre_comercial=?, direccion=?, estado_sunat=? WHERE id=?',
            [razon_social, nombre_comercial, direccion, estado_sunat, req.params.id]
        );
        return res.json({ success: true, mensaje: 'Empresa actualizada correctamente' });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al actualizar' });
    }
});

// routes/admin.js
router.post('/empresa', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const { ruc, razon_social, nombre_comercial, direccion, estado_sunat } = req.body;

    try {
        // Validar si el RUC ya existe
        const existe = await pool.query('SELECT id FROM empresas WHERE ruc = ?', [ruc]);
        if (existe.length > 0) {
            return res.status(400).json({ success: false, mensaje: 'Este RUC ya está registrado' });
        }

        const query = `
            INSERT INTO empresas (ruc, razon_social, nombre_comercial, direccion, estado_sunat) 
            VALUES (?, ?, ?, ?, ?)
        `;
        await pool.query(query, [ruc, razon_social, nombre_comercial, direccion, estado_sunat || 'ACTIVO']);

        return res.json({ success: true, mensaje: 'Empresa registrada exitosamente' });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, mensaje: 'Error al registrar empresa' });
    }
});

module.exports = router;