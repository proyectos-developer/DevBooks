const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isCliente } = require('../authmiddleware');

// routes/perfil.js
// 1. Obtener datos del perfil actual
router.get('/perfil', passport.authenticate('jwt', { session: false }), isCliente, async (req, res) => {
    try {
        const user = await pool.query(
            "SELECT nombre, apellido, email, rol, fecha_registro FROM usuarios WHERE id = ?",
            [req.user.id]
        );
        return res.json({ success: true, user: user[0] });
    } catch (error) {
        return res.json({ success: false });
    }
});

// 2. Actualizar datos (Nombre, Apellido o Password)
router.post('/perfil', passport.authenticate('jwt', { session: false }), isCliente, async (req, res) => {
    const { nombre, apellido, password } = req.body;
    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query("UPDATE usuarios SET nombre=?, apellido=?, password=? WHERE id=?", 
            [nombre, apellido, hashedPassword, req.user.id]);
        } else {
            await pool.query("UPDATE usuarios SET nombre=?, apellido=? WHERE id=?", 
            [nombre, apellido, req.user.id]);
        }
        return res.json({ success: true, mensaje: "Perfil actualizado" });
    } catch (error) {
        return res.json({ success: false });
    }
});

module.exports = router;