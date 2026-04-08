const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isAdmin } = require('../authmiddleware');

// routes/admin.js
router.get('/usuarios', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id, 
                u.nombre, 
                u.apellido, 
                u.email, 
                u.rol, 
                u.estado, 
                e.razon_social as empresa_nombre
            FROM usuarios u
            INNER JOIN empresas e ON u.id_empresa = e.id
            ORDER BY u.fecha_registro DESC
        `;
        
        const usuarios = await pool.query(query);
        return res.json({ success: true, usuarios });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al obtener usuarios' });
    }
});

// Obtener datos del usuario para editar
router.get('/usuario/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const rows = await pool.query('SELECT id, id_empresa, nombre, apellido, email, rol, estado FROM usuarios WHERE id = ?', [req.params.id]);
        return res.json({ success: true, usuario: rows[0] });
    } catch (error) {
        return res.json({ success: false });
    }
});

// Guardar cambios del usuario
router.post('/usuario/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const { nombre, apellido, rol, estado } = req.body;
    try {
        await pool.query(
            'UPDATE usuarios SET nombre=?, apellido=?, rol=?, estado=? WHERE id=?',
            [nombre, apellido, rol, estado, req.params.id]
        );
        return res.json({ success: true, mensaje: 'Usuario actualizado' });
    } catch (error) {
        return res.json({ success: false });
    }
});

// routes/admin.js
const bcrypt = require('bcryptjs');

router.post('/usuario', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const { id_empresa, nombre, apellido, email, rol } = req.body;

    try {
        // Verificar si el email ya existe
        const existe = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existe.length > 0) return res.status(400).json({ success: false, mensaje: 'El email ya está registrado' });

        // Contraseña temporal por defecto (luego el usuario la cambia)
        const passTemporal = await bcrypt.hash('Temporal123!', 10);

        const query = `
            INSERT INTO usuarios (id_empresa, nombre, apellido, email, password, rol, estado, primer_ingreso) 
            VALUES (?, ?, ?, ?, ?, ?, 1, 1)
        `;
        
        await pool.query(query, [id_empresa, nombre, apellido, email, passTemporal, rol]);

        return res.json({ success: true, mensaje: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, mensaje: 'Error al crear usuario' });
    }
});

module.exports = router;