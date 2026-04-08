const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isContador } = require('../authmiddleware');

// Obtener datos para la vista de conciliación

// Obtener todas las cuentas bancarias de la empresa (para el selector)
router.get('/cuentas-bancarias', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const id_empresa = req.user.id_empresa;
        const cuentas = await pool.query(
            "SELECT id, banco, numero_cuenta, moneda FROM cuentas_bancarias WHERE id_empresa = ?",
            [id_empresa]
        );
        return res.json({ success: true, cuentas });
    } catch (error) {
        return res.json({ success: false });
    }
});

// Obtener movimientos para conciliación
router.get('/conciliacion/:id_cuenta_bancaria', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const { id_cuenta_bancaria } = req.params;
        const id_empresa = req.user.id_empresa;

        // 1. Obtener la cuenta contable asociada (Desestructurando el primer resultado)
        const cuentaBan = await pool.query(
            "SELECT id_cuenta_contable FROM cuentas_bancarias WHERE id = ? AND id_empresa = ?",
            [id_cuenta_bancaria, id_empresa]
        );

        if (cuentaBan.length === 0) return res.json({ success: false, mensaje: "Cuenta no encontrada" });
        const id_cuenta_pcge = cuentaBan[0].id_cuenta_contable;

        // 2. Movimientos del Banco aún NO conciliados
        const extracto = await pool.query(
            "SELECT * FROM banco_movimientos WHERE id_cuenta_bancaria = ? AND estado_conciliacion = 0 ORDER BY fecha_operacion ASC",
            [id_cuenta_bancaria]
        );

        // 3. Asientos Contables de esa cuenta NO conciliados
        const contabilidad = await pool.query(
            `SELECT ad.*, ac.glosa, ac.fecha_asiento 
             FROM asientos_detalle ad
             JOIN asientos_cabecera ac ON ad.id_asiento = ac.id
             WHERE ac.id_empresa = ? AND ad.id_cuenta = ?
             AND ad.id NOT IN (SELECT id_asiento_detalle FROM banco_movimientos WHERE id_asiento_detalle IS NOT NULL)
             ORDER BY ac.fecha_asiento ASC`,
            [id_empresa, id_cuenta_pcge]
        );

        return res.json({ success: true, extracto, contabilidad });
    } catch (error) {
        return res.json({ success: false });
    }
});

router.post('/conciliar-vincular', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    const { id_mov_banco, id_asiento_detalle } = req.body;
    try {
        await pool.query(
            "UPDATE banco_movimientos SET id_asiento_detalle = ?, estado_conciliacion = 1 WHERE id = ?",
            [id_asiento_detalle, id_mov_banco]
        );
        return res.json({ success: true, mensaje: "Movimientos conciliados con éxito" });
    } catch (error) {
        return res.json({ success: false });
    }
});

module.exports = router;