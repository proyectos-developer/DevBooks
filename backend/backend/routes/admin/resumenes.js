const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isAdmin } = require('../authmiddleware');

// routes/admin.js
router.get('/resumenes', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        // Consultas en paralelo para optimizar rendimiento
        const totalEmpresas = await pool.query('SELECT COUNT(*) as count FROM empresas');
        const totalUsuarios = await pool.query('SELECT COUNT(*) as count FROM usuarios');
        const usuariosActivos = await pool.query('SELECT COUNT(*) as count FROM usuarios WHERE estado = 1');
        const ultimasEmpresas = await pool.query(
            'SELECT ruc, razon_social, created_at FROM empresas ORDER BY created_at DESC LIMIT 5'
        );
        const asientosRecientes = await pool.query(
            `SELECT ac.fecha_asiento, e.razon_social, ac.glosa 
             FROM asientos_cabecera ac 
             JOIN empresas e ON ac.id_empresa = e.id 
             ORDER BY ac.created_at DESC LIMIT 5`
        );

        return res.json({
            success: true,
            stats: {
                totalEmpresas: totalEmpresas[0].count,
                totalUsuarios: totalUsuarios[0].count,
                usuariosActivos: usuariosActivos[0].count,
                tasaActividad: ((usuariosActivos[0].count / totalUsuarios[0].count) * 100).toFixed(1)
            },
            ultimasEmpresas,
            asientosRecientes
        });

    } catch (error) {
        console.error('Error en stats admin:', error);
        return res.json({ success: false, mensaje: 'Error al cargar estadísticas.' });
    }
});

module.exports = router;