const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isContador } = require('../authmiddleware');

// GET /apimovil/auth/perfil
router.get('/perfil', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        // El id del usuario viene del token JWT
        const id_usuario = req.user.id;

        const user = await pool.query(
            `SELECT u.nombre, u.apellido, u.email, u.rol, e.razon_social as empresa 
             FROM usuarios u
             JOIN empresas e ON u.id_empresa = e.id
             WHERE u.id = ?`,
            [id_usuario]
        );

        if (user.length === 0) return res.json({ success: false, mensaje: 'Usuario no encontrado' });

        return res.json({
            success: true,
            data: user[0]
        });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al obtener perfil' });
    }
});

const bcrypt = require('bcryptjs');

// RUTA: PUT /apimovil/auth/change-password
router.post('/change-password', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const id_usuario = req.user.id; // Extraído del JWT

    try {
        // 1. Obtener la contraseña actual encriptada (Tabla 2)
        const user = await pool.query('SELECT password FROM usuarios WHERE id = ?', [id_usuario]);
        
        // 2. Validar contraseña antigua
        const isMatch = await bcrypt.compare(oldPassword, user[0].password);
        if (!isMatch) {
            return res.json({ success: false, mensaje: 'La contraseña actual es incorrecta' });
        }

        // 3. Encriptar nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPsw = await bcrypt.hash(newPassword, salt);

        // 4. Actualizar en la base de datos
        await pool.query('UPDATE usuarios SET password = ?, primer_ingreso = 0 WHERE id = ?', [hashedPsw, id_usuario]);

        return res.json({ success: true, mensaje: 'Contraseña actualizada correctamente' });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al actualizar contraseña' });
    }
});

// GET /apimovil/contador/notificaciones
router.get('/notificaciones', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    const id_usuario = req.user.id;

    try {
        const rows = await pool.query(
            `SELECT id, titulo, mensaje, tipo, leido, fecha_registro 
             FROM notificaciones 
             WHERE id_usuario = ? 
             ORDER BY fecha_registro DESC LIMIT 50`,
            [id_usuario]
        );

        // Opcional: Marcar todas como leídas al abrir
        await pool.query('UPDATE notificaciones SET leido = 1 WHERE id_usuario = ?', [id_usuario]);

        return res.json({ success: true, data: rows });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al obtener notificaciones' });
    }
});

router.post('/soporte/ticket', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    const { asunto, mensaje, prioridad } = req.body;
    const { id, id_empresa } = req.user;

    try {
        await pool.query(
            `INSERT INTO soporte_tickets (id_empresa, id_usuario, asunto, mensaje, prioridad) 
             VALUES (?, ?, ?, ?, ?)`,
            [id_empresa, id, asunto, mensaje, prioridad]
        );

        return res.json({ success: true, mensaje: 'Ticket creado con éxito. Nos contactaremos pronto.' });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al enviar ticket' });
    }
});

router.get('/sistema/info', (req, res) => {
    res.json({
        success: true,
        data: {
            version: '1.0.4',
            build: '20260407',
            agencia: 'Developer Ideas',
            web: 'https://developer-ideas.com',
            terminos: 'https://devbooks.com/terms'
        }
    });
});

module.exports = router;