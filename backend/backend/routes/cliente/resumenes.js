const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isCliente } = require('../authmiddleware');

// router.get('/home-cliente-stats', ...
router.get('/resumenes', passport.authenticate('jwt', { session: false }), isCliente, async (req, res) => {
    try {
        const id_empresa = req.user.id_empresa;

        // 1. Obtener el último periodo abierto
        const ultimoPeriodo = await pool.query(
            "SELECT id, anio, mes, estado_sire FROM periodos WHERE id_empresa = ? ORDER BY anio DESC, mes DESC LIMIT 1",
            [id_empresa]
        );

        if (ultimoPeriodo.length === 0) {
            return res.json({ success: true, noData: true });
        }

        const id_periodo = ultimoPeriodo[0].id;

        // 2. Resumen de Ventas SIRE (Propuesta vs Local)
        const statsVentas = await pool.query(
            `SELECT 
                COUNT(*) as total_docs,
                SUM(monto_total) as monto_total,
                (SELECT COUNT(*) FROM asientos_detalle ad 
                 JOIN asientos_cabecera ac ON ad.id_asiento = ac.id 
                 WHERE ac.id_periodo = ? AND ac.tipo_libro = 'VENTAS') as docs_locales
             FROM sire_propuesta_ventas 
             WHERE id_empresa = ? AND id_periodo = ?`,
            [id_periodo, id_empresa, id_periodo]
        );

        // 3. Resumen de Compras SIRE
        const statsCompras = await pool.query(
            `SELECT 
                COUNT(*) as total_docs,
                SUM(monto_total) as monto_total
             FROM sire_propuesta_compras 
             WHERE id_empresa = ? AND id_periodo = ?`,
            [id_periodo, id_empresa, id_periodo]
        );

        // 4. Datos de la empresa
        const empresa = await pool.query(
            "SELECT razon_social, ruc, estado_sunat FROM empresas WHERE id = ?",
            [id_empresa]
        );

        return res.json({
            success: true,
            periodo: ultimoPeriodo[0],
            ventas: statsVentas[0],
            compras: statsCompras[0],
            empresa: empresa[0]
        });
    } catch (error) {
        console.error(error);
        return res.json({ success: false });
    }
});

// router.get('/periodos-cliente', ...
router.get('/periodos-cliente', passport.authenticate('jwt', { session: false }), isCliente, async (req, res) => {
    try {
        const id_empresa = req.user.id_empresa;

        const periodos = await pool.query(
            `SELECT id, anio, mes, cerrado, estado_sire 
             FROM periodos 
             WHERE id_empresa = ? 
             ORDER BY anio DESC, mes DESC`,
            [id_empresa]
        );

        return res.json({ success: true, periodos });
    } catch (error) {
        console.error("Error al obtener periodos del cliente:", error);
        return res.json({ success: false });
    }
});

module.exports = router;