const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isContador } = require('../authmiddleware');

// 1. Listar todos los periodos de la empresa
router.get('/periodos-all', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const rows = await pool.query(
            "SELECT * FROM periodos WHERE id_empresa = ? ORDER BY anio DESC, mes DESC",
            [req.user.id_empresa]
        );
        return res.json({ success: true, periodos: rows });
    } catch (error) {
        return res.json({ success: false });
    }
});

// 2. Cerrar un periodo (no permite más asientos)
router.post('/periodos-cerrar/:id', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            "UPDATE periodos SET cerrado = 1 WHERE id = ? AND id_empresa = ?",
            [id, req.user.id_empresa]
        );
        return res.json({ success: true, mensaje: 'Mes cerrado correctamente' });
    } catch (error) {
        return res.json({ success: false });
    }
});

// routes/contador.js
router.post('/periodo-crear', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const { mes, anio } = req.body;
        const id_empresa = req.user.id_empresa;

        // 1. Validar duplicidad
        const existe = await pool.query(
            "SELECT id FROM periodos WHERE mes = ? AND anio = ? AND id_empresa = ?",
            [mes, anio, id_empresa]
        );

        if (existe.length > 0) {
            return res.json({ success: false, mensaje: 'Este periodo ya se encuentra abierto.' });
        }

        // 2. Insertar nuevo periodo (cerrado = 0 por defecto)
        await pool.query(
            "INSERT INTO periodos (id_empresa, mes, anio, cerrado) VALUES (?, ?, ?, 0)",
            [id_empresa, mes, anio]
        );

        return res.json({ success: true, mensaje: 'Periodo abierto con éxito' });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, mensaje: 'Error al abrir periodo' });
    }
});

module.exports = router;