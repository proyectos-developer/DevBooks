const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isAdmin } = require('../authmiddleware');

// Actualizar datos básicos
router.post('/perfil', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const { nombre, apellido, email } = req.body;
    const id_usuario = req.user.id;

    try {
        await pool.query(
            'UPDATE usuarios SET nombre = ?, apellido = ?, email = ? WHERE id = ?',
            [nombre, apellido, email, id_usuario]
        );
        return res.json({ success: true, mensaje: 'Perfil actualizado' });
    } catch (error) {
        return res.json({ success: false });
    }
});

const bcrypt = require('bcryptjs');

// Cambiar contraseña
router.post('/cambiar-password', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const { passwordActual, nuevaPassword } = req.body;
    const id_usuario = req.user.id;

    try {
        const user = await pool.query('SELECT password FROM usuarios WHERE id = ?', [id_usuario]);
        const match = await bcrypt.compare(passwordActual, user[0].password);

        if (!match) return res.json({ success: false, mensaje: 'Contraseña actual incorrecta' });

        const hashed = await bcrypt.hash(nuevaPassword, 10);
        await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashed, id_usuario]);

        return res.json({ success: true, mensaje: 'Contraseña cambiada' });
    } catch (error) {
        return res.json({ success: false });
    }
});

module.exports = router;