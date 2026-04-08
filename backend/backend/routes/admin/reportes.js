const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isAdmin } = require('../authmiddleware');

// routes/admin.js
router.get('/reportes-globales', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        // Ejemplo: Sumatoria de movimientos por empresa
        const query = `
            SELECT 
                e.id,
                e.razon_social,
                SUM(ad.debe) as total_debe,
                SUM(ad.haber) as total_haber,
                COUNT(DISTINCT ac.id) as total_asientos
            FROM empresas e
            LEFT JOIN asientos_cabecera ac ON e.id = ac.id_empresa
            LEFT JOIN asientos_detalle ad ON ac.id = ad.id_asiento
            GROUP BY e.id
        `;
        
        const reporte = await pool.query(query);
        return res.json({ success: true, reporte });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al generar reporte global' });
    }
});

// routes/admin.js
router.get('/reportes-detalle/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        // Consulta para obtener resumen de ingresos/gastos por mes de la empresa
        const query = `
            SELECT 
                p.mes, p.anio,
                SUM(ad.debe) as total_debe,
                SUM(ad.haber) as total_haber
            FROM asientos_cabecera ac
            JOIN asientos_detalle ad ON ac.id = ad.id_asiento
            JOIN periodos p ON ac.id_periodo = p.id
            WHERE ac.id_empresa = ?
            GROUP BY p.anio, p.mes
            ORDER BY p.anio DESC, p.mes DESC
        `;
        
        const detalles = await pool.query(query, [id]);
        return res.json({ success: true, detalles });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al obtener detalle' });
    }
});

module.exports = router;