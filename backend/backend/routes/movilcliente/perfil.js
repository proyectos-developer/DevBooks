const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isCliente } = require('../authmiddleware');

// GET /apimovil/auth/perfil
router.get('/perfil', passport.authenticate('jwt', { session: false }), isCliente, async (req, res) => {
    try {
        const id_usuario = req.user.id;

        const user = await pool.query(
            `SELECT u.nombre, u.apellido, u.email, u.rol, e.razon_social as empresa 
             FROM usuarios u
             INNER JOIN empresas e ON u.id_empresa = e.id
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
// @route   POST /apimovil/auth/change-password
// @desc    Cambiar contraseña del usuario autenticado
// @access  Private
router.post('/change-password', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // 1. Validaciones básicas
    if (!oldPassword || !newPassword || !confirmPassword) {
        return res.json({ success: false, mensaje: 'Por favor, completa todos los campos.' });
    }

    if (newPassword !== confirmPassword) {
        return res.json({ success: false, mensaje: 'La nueva contraseña y la confirmación no coinciden.' });
    }

    if (newPassword.length < 8) {
        return res.json({ success: false, mensaje: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    }

    try {
        // 2. Obtener el usuario actual de la base de datos (Tabla 2)
        const rows = await pool.query('SELECT password FROM usuarios WHERE id = ?', [userId]);
        
        if (rows.length === 0) {
            return res.json({ success: false, mensaje: 'Usuario no encontrado.' });
        }

        const user = rows[0];

        // 3. Verificar si la contraseña actual es correcta
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.json({ success: false, mensaje: 'La contraseña actual es incorrecta.' });
        }

        // 4. Verificar que la nueva contraseña no sea igual a la anterior
        const isSameAsOld = await bcrypt.compare(newPassword, user.password);
        if (isSameAsOld) {
            return res.json({ success: false, mensaje: 'La nueva contraseña no puede ser igual a la anterior.' });
        }

        // 5. Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 6. Actualizar en la base de datos y cambiar estado de 'primer_ingreso' si aplica
        await pool.query(
            'UPDATE usuarios SET password = ?, primer_ingreso = 0 WHERE id = ?', 
            [hashedPassword, userId]
        );

        return res.json({ 
            success: true, 
            mensaje: 'Contraseña actualizada correctamente.' 
        });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return res.json({ 
            success: false, 
            mensaje: 'Error interno del servidor al procesar la solicitud.' 
        });
    }
});

module.exports = router;