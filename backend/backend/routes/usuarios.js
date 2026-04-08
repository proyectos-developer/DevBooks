const express = require('express');
const router = express.Router();
const passport = require('passport');

const pool = require('../database');

// Ruta: /api/auth/usuario
// Se asume el uso de un middleware 'verificarToken' que añade req.user.id_usuario
// Middleware 'verificarToken' extrae el id del JWT y lo pone en req.user.id_usuario
router.get('/usuario', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Consultamos los datos uniendo la tabla usuarios con empresas para tener el RUC
        const query = `
            SELECT 
                u.id, 
                u.id_empresa, 
                u.nombre, 
                u.apellido, 
                u.email, 
                u.rol, 
                u.primer_ingreso, 
                u.estado,
                e.ruc,
                e.razon_social
            FROM usuarios u
            INNER JOIN empresas e ON u.id_empresa = e.id
            WHERE u.id = ? AND u.estado = 1
        `;

        const rows = await pool.query(query, [req.user.id]);

        if (rows.length === 0) {
            return res.json({ 
                success: false, 
                mensaje: 'Usuario no encontrado o cuenta inactiva.' 
            });
        }

        const user = rows[0];

        // Devolvemos la estructura exacta que espera normalizarUsuario() en tu React
        return res.json({
            success: true,
            usuario: {
                id: user.id,
                id_empresa: user.id_empresa,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                rol: user.rol,
                primerIngreso: user.primer_ingreso === 1,
                ruc: user.ruc,
                razonSocial: user.razon_social
            }
        });

    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        return res.json({ 
            success: false, 
            mensaje: 'Error interno del servidor.' 
        });
    }
});

module.exports = router;