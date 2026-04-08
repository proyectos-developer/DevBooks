const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isAdmin } = require('../authmiddleware');

// Listar usuarios de la empresa del administrador
router.get('/listar-usuarios', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const id_empresa = req.user.id_empresa; // Extraído de tu JWT
    try {
        const rows = await pool.query(
            `SELECT id, nombre, apellido, email, rol, estado, fecha_registro 
             FROM usuarios 
             WHERE id_empresa = ? AND id != ?`, // Excluimos al admin actual de la lista
            [id_empresa, req.user.id]
        );
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, mensaje: 'Error al obtener usuarios' });
    }
});

// Cambiar estado (Activo/Inactivo) de un usuario
router.post('/usuario-estado', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const { id_usuario, nuevo_estado } = req.body;
    const id_empresa = req.user.id_empresa;

    try {
        await pool.query(
            'UPDATE usuarios SET estado = ? WHERE id = ? AND id_empresa = ?',
            [nuevo_estado, id_usuario, id_empresa]
        );
        return res.json({ success: true, mensaje: 'Estado actualizado' });
    } catch (error) {
        return res.json({ success: false });
    }
});

module.exports = router;