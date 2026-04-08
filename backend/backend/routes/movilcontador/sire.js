const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isContador } = require('../authmiddleware');

// GET /apimovil/contador/sire/resumen
router.get('/sire/resumen', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    const id_empresa = req.user.id_empresa;
    const { mes, anio } = req.query;

    try {
        // Consultar Ventas SIRE (Tabla 12)
        const ventas = await pool.query(
            `SELECT * FROM sire_propuesta_ventas 
             WHERE id_empresa = ? AND id_periodo = (SELECT id FROM periodos WHERE mes = ? AND anio = ? AND id_empresa = ?)`,
            [id_empresa, mes, anio, id_empresa]
        );

        // Consultar Compras SIRE (Tabla 13)
        const compras = await pool.query(
            `SELECT * FROM sire_propuesta_compras 
             WHERE id_empresa = ? AND id_periodo = (SELECT id FROM periodos WHERE mes = ? AND anio = ? AND id_empresa = ?)`,
            [id_empresa, mes, anio, id_empresa]
        );

        return res.json({
            success: true,
            data: { ventas, compras }
        });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al consultar propuestas SIRE' });
    }
});

router.get('/sire/detalle/:tipo/:id', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    const { tipo, id } = req.params;
    const id_empresa = req.user.id_empresa;
    const tabla = tipo === 'venta' ? 'sire_propuesta_ventas' : 'sire_propuesta_compras';

    try {
        // 1. Obtener el registro de la propuesta SIRE
        const sireDoc = await pool.query(`SELECT * FROM ${tabla} WHERE id = ? AND id_empresa = ?`, [id, id_empresa]);

        if (sireDoc.length === 0) return res.json({ success: false, mensaje: 'Documento no encontrado' });

        // 2. Si ya está vinculado, traer el detalle del asiento contable local (Tabla 9)
        let asientoLocal = null;
        if (sireDoc[0].id_asiento_detalle) {
            const asiento = await pool.query(
                `SELECT ad.*, ac.glosa, ac.fecha_asiento 
                 FROM asientos_detalle ad 
                 JOIN asientos_cabecera ac ON ad.id_asiento = ac.id 
                 WHERE ad.id = ?`, 
                [sireDoc[0].id_asiento_detalle]
            );
            asientoLocal = asiento[0];
        }

        return res.json({
            success: true,
            data: {
                sire: sireDoc[0],
                contabilidad_local: asientoLocal
            }
        });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error al consultar detalle' });
    }
});

module.exports = router;