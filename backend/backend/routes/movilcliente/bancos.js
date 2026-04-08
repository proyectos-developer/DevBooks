const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isCliente } = require('../authmiddleware');

// GET /apimovil/cliente/bancos/listado
router.get('/listado-bancos', passport.authenticate('jwt', { session: false }), isCliente, async (req, res) => {
    const id_empresa = req.user.id_empresa;

    try {
        const cuentas = await pool.query(
            `SELECT 
                cb.id, 
                cb.banco, 
                cb.numero_cuenta, 
                cb.moneda, 
                COALESCE(SUM(bm.monto), 0) as saldo_actual
             FROM cuentas_bancarias cb
             LEFT JOIN banco_movimientos bm ON cb.id = bm.id_cuenta_bancaria
             WHERE cb.id_empresa = ?
             GROUP BY cb.id`,
            [id_empresa]
        );

        return res.json({ success: true, data: cuentas });
    } catch (error) {
        console.log (error)
        return res.json({ success: false, mensaje: 'Error al obtener saldos bancarios' });
    }
});

module.exports = router;