const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isAdmin } = require('../authmiddleware');

router.get('/resumenes', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const id_empresa = req.user.id_empresa;

        // 1. Saldo Total en Bancos (Suma de todas las cuentas bancarias)
        const bancos = await pool.query(
            `SELECT SUM(monto) as total FROM banco_movimientos bm
             JOIN cuentas_bancarias cb ON bm.id_cuenta_bancaria = cb.id
             WHERE cb.id_empresa = ?`, [id_empresa]
        );

        // 2. Estado de Periodos (Cuántos abiertos vs cerrados este año)
        const periodos = await pool.query(
            `SELECT cerrado, COUNT(*) as cantidad FROM periodos 
             WHERE id_empresa = ? AND anio = YEAR(CURDATE()) GROUP BY cerrado`, [id_empresa]
        );

        // 3. Resumen SIRE Ventas (Pendientes de procesar)
        const sireVentas = await pool.query(
            `SELECT COUNT(*) as pendientes FROM sire_propuesta_ventas 
             WHERE id_empresa = ? AND estado_sire = 'PENDIENTE'`, [id_empresa]
        );

        // 4. Últimos Asientos Registrados
        const ultimosAsientos = await pool.query(
            `SELECT ac.glosa, ac.fecha_asiento, SUM(ad.debe) as total, ac.id
             FROM asientos_cabecera ac
             JOIN asientos_detalle ad ON ac.id = ad.id_asiento
             WHERE ac.id_empresa = ?
             GROUP BY ac.id ORDER BY ac.fecha_asiento DESC LIMIT 5`, [id_empresa]
        );

        return res.json({
            success: true,
            stats: {
                saldoBancario: bancos[0].total || 0,
                periodos,
                sirePendientes: sireVentas[0].pendientes,
                recientes: ultimosAsientos
            }
        });
    } catch (error) {
        return res.json({ success: false });
    }
});

router.get('/asiento-detalle/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const { id } = req.params;
    const id_empresa = req.user.id_empresa; // Obtenido del JWT

    try {
        // 1. Obtener Cabecera (Tabla 8) y Periodo (Tabla 3)
        const cabecera = await pool.query(
            `SELECT ac.*, p.anio, p.mes, u.nombre as registrado_por
             FROM asientos_cabecera ac
             JOIN periodos p ON ac.id_periodo = p.id
             JOIN usuarios u ON ac.id_usuario = u.id
             WHERE ac.id = ? AND ac.id_empresa = ?`,
            [id, id_empresa]
        );

        if (cabecera.length === 0) {
            return res.status(404).json({ success: false, mensaje: 'Asiento no encontrado' });
        }

        // 2. Obtener Detalles (Tabla 9) con Cuentas (Tabla 4) y Entidades (Tabla 7)
        const movimientos = await pool.query(
            `SELECT 
                ad.*, 
                pc.codigo as cuenta_codigo, 
                pc.descripcion as cuenta_nombre,
                ent.nombre_razon_social as entidad_nombre,
                tc.descripcion as comprobante_tipo_nombre
             FROM asientos_detalle ad
             JOIN plan_contable pc ON ad.id_cuenta = pc.id
             LEFT JOIN entidades ent ON ad.id_entidad = ent.id
             LEFT JOIN tipos_comprobante tc ON ad.tipo_comprobante = tc.codigo
             WHERE ad.id_asiento = ?
             ORDER BY ad.debe DESC`, // Convención contable: Debe primero
            [id]
        );

        // 3. Cálculo de totales para validar Partida Doble
        const totales = movimientos.reduce((acc, mov) => {
            acc.debe += parseFloat(mov.debe || 0);
            acc.haber += parseFloat(mov.haber || 0);
            return acc;
        }, { debe: 0, haber: 0 });

        return res.json({
            success: true,
            data: {
                cabecera: cabecera[0],
                movimientos,
                cuadre: {
                    totalDebe: totales.debe.toFixed(2),
                    totalHaber: totales.haber.toFixed(2),
                    diferencia: (totales.debe - totales.haber).toFixed(2)
                }
            }
        });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, mensaje: 'Error al consultar la base de datos' });
    }
});

// routes/admin.js
router.get('/listar-asientos', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    const id_empresa = req.user.id_empresa;
    const { mes, anio } = req.query; // Filtros opcionales

    try {
        let query = `
            SELECT ac.id, ac.glosa, ac.fecha_asiento, ac.tipo_libro, ac.moneda,
                   (SELECT SUM(debe) FROM asientos_detalle WHERE id_asiento = ac.id) as total
            FROM asientos_cabecera ac
            WHERE ac.id_empresa = ?
        `;
        const params = [id_empresa];

        if (mes && anio) {
            query += ` AND EXISTS (SELECT 1 FROM periodos p WHERE p.id = ac.id_periodo AND p.mes = ? AND p.anio = ?)`;
            params.push(mes, anio);
        }

        query += ` ORDER BY ac.fecha_asiento DESC`;

        const rows = await pool.query(query, params);
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        return res.json({ success: false });
    }
});

module.exports = router;