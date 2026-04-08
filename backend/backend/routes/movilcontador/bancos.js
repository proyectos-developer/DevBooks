const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isContador } = require('../authmiddleware');

// GET /apimovil/contador/bancos
router.get('/bancos', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    const id_empresa = req.user.id_empresa;

    try {
        // Obtenemos cuentas bancarias y cuántos movimientos están en estado_conciliacion = 0
        const cuentas = await pool.query(
            `SELECT 
                cb.id, cb.banco, cb.numero_cuenta, cb.moneda,
                pc.codigo as cuenta_contable,
                (SELECT COUNT(*) FROM banco_movimientos WHERE id_cuenta_bancaria = cb.id AND estado_conciliacion = 0) as pendientes
             FROM cuentas_bancarias cb
             JOIN plan_contable pc ON cb.id_cuenta_contable = pc.id
             WHERE cb.id_empresa = ?`,
            [id_empresa]
        );

        return res.json({ success: true, data: cuentas });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al obtener datos bancarios' });
    }
});

// Endpoint: GET /apimovil/contador/bancos/movimientos/:id_cuenta
router.get('/banco/movimientos/:id', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    const { id } = req.params; // id de cuentas_bancarias
    const id_empresa = req.user.id_empresa;

    try {
        // 1. Obtener info de la cuenta y su relación con el PCGE (Tablas 10 y 4)
        const cuentaInfo = await pool.query(
            `SELECT cb.*, pc.codigo as pcge_codigo, pc.descripcion as pcge_nombre 
             FROM cuentas_bancarias cb
             JOIN plan_contable pc ON cb.id_cuenta_contable = pc.id
             WHERE cb.id = ? AND cb.id_empresa = ?`,
            [id, id_empresa]
        );

        if (cuentaInfo.length === 0) {
            return res.status(404).json({ success: false, mensaje: 'Cuenta no encontrada' });
        }

        // 2. Obtener movimientos del extracto (Tabla 11)
        const movimientos = await pool.query(
            `SELECT id, fecha_operacion, descripcion_banco, referencia_operacion, monto, estado_conciliacion, id_asiento_detalle
             FROM banco_movimientos 
             WHERE id_cuenta_bancaria = ? 
             ORDER BY fecha_operacion DESC`,
            [id]
        );

        return res.json({
            success: true,
            data: {
                cuenta: cuentaInfo[0],
                movimientos: movimientos
            }
        });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, mensaje: 'Error al obtener movimientos bancarios' });
    }
});

module.exports = router;