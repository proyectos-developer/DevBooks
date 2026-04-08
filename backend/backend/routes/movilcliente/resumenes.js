const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isCliente } = require('../authmiddleware');

router.get('/resumenes', passport.authenticate('jwt', { session: false }), isCliente, async (req, res) => {
    const id_empresa = req.user.id_empresa;
    const { mes, anio } = req.query; // Periodo actual

    try {
        // 1. Resumen de Ventas y Compras del mes (Desde SIRE para ver lo reportado a SUNAT)
        const sireResumen = await pool.query(
            `SELECT 
                (SELECT SUM(monto_total) FROM sire_propuesta_ventas WHERE id_empresa = ? AND MONTH(fecha_emision) = ? AND YEAR(fecha_emision) = ?) as total_ventas,
                (SELECT SUM(monto_total) FROM sire_propuesta_compras WHERE id_empresa = ? AND MONTH(fecha_emision) = ? AND YEAR(fecha_emision) = ?) as total_compras`,
            [id_empresa, mes, anio, id_empresa, mes, anio]
        );

        // 2. Saldos en Bancos (Tabla 10 y 11)
        const bancos = await pool.query(
            `SELECT cb.banco, cb.moneda, SUM(bm.monto) as saldo_actual
             FROM cuentas_bancarias cb
             LEFT JOIN banco_movimientos bm ON cb.id = bm.id_cuenta_bancaria
             WHERE cb.id_empresa = ?
             GROUP BY cb.id`,
            [id_empresa]
        );

        // 3. Top Clientes (Tabla 7 y 9)
        const topClientes = await pool.query(
            `SELECT e.nombre_razon_social, SUM(ad.haber) as total_comprado
             FROM asientos_detalle ad
             JOIN entidades e ON ad.id_entidad = e.id
             JOIN asientos_cabecera ac ON ad.id_asiento = ac.id
             WHERE ac.id_empresa = ? AND e.es_cliente = 1 AND ac.tipo_libro = 'VENTAS'
             GROUP BY e.id ORDER BY total_comprado DESC LIMIT 3`,
            [id_empresa]
        );

        return res.json({
            success: true,
            data: {
                metricas: sireResumen[0],
                bancos,
                topClientes
            }
        });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al cargar dashboard' });
    }
});

module.exports = router;