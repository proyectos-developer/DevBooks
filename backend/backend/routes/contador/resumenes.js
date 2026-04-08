const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isContador } = require('../authmiddleware');

// routes/contador.js
router.get('/resumenes', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const id_empresa = req.user.id_empresa; // Extraído del token

        // 1. Obtener Periodo Actual Abierto
        const periodo = await pool.query(
            'SELECT id, mes, anio FROM periodos WHERE id_empresa = ? AND cerrado = 0 ORDER BY anio DESC, mes DESC LIMIT 1',
            [id_empresa]
        );

        if (!periodo.length) return res.json({ success: true, stats: null });

        const id_periodo = periodo[0].id;

        // 2. Métricas: Total de Asientos y Sumas de Debe/Haber del mes
        const statsQuery = `
            SELECT 
                COUNT(ac.id) as total_asientos,
                COALESCE(SUM(ad.debe), 0) as suma_debe,
                COALESCE(SUM(ad.haber), 0) as suma_haber
            FROM asientos_cabecera ac
            LEFT JOIN asientos_detalle ad ON ac.id = ad.id_asiento
            WHERE ac.id_periodo = ?
        `;
        
        // 3. Últimos 5 Asientos registrados
        const asientosQuery = `
            SELECT id, fecha_asiento, glosa, tipo_libro 
            FROM asientos_cabecera 
            WHERE id_empresa = ? 
            ORDER BY created_at DESC LIMIT 5
        `;

        const stats = await pool.query(statsQuery, [id_periodo]);
        const asientos = await pool.query(asientosQuery, [id_empresa]);

        return res.json({ 
            success: true, 
            periodo: periodo[0],
            stats: stats[0],
            ultimos_asientos: asientos 
        });
    } catch (error) {
        return res.json({ success: false, mensaje: 'Error en dashboard' });
    }
});


/**
 * 1. GET PERIODOS ABIERTOS
 * Retorna los meses que no han sido cerrados para permitir registros.
 */
router.get('/periodos-abiertos', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const id_empresa = req.user.id_empresa;
        
        const periodos = await pool.query(
            `SELECT id, mes, anio 
             FROM periodos 
             WHERE id_empresa = ? AND cerrado = 0 
             ORDER BY anio DESC, mes DESC`,
            [id_empresa]
        );

        return res.json({ success: true, periodos });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, mensaje: 'Error al obtener periodos' });
    }
});

/**
 * 2. GET ENTIDADES
 * Retorna clientes y proveedores para vincular al detalle del asiento (SIRE/PLE).
 */
router.get('/entidades', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const id_empresa = req.user.id_empresa;

        const entidades = await pool.query(
            `SELECT id, numero_documento, nombre_razon_social, tipo_documento 
             FROM entidades 
             WHERE id_empresa = ? 
             ORDER BY nombre_razon_social ASC`,
            [id_empresa]
        );

        return res.json({ success: true, entidades });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, mensaje: 'Error al obtener entidades' });
    }
});

/**
 * 3. GET PLAN CONTABLE
 * Retorna solo las cuentas que permiten movimiento (nivel de registro).
 */
router.get('/plan-contable', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const id_empresa = req.user.id_empresa;

        const cuentas = await pool.query(
            `SELECT id, codigo, descripcion 
             FROM plan_contable 
             WHERE id_empresa = ? AND permite_movimiento = 1 
             ORDER BY codigo ASC`,
            [id_empresa]
        );

        return res.json({ success: true, cuentas });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, mensaje: 'Error al obtener plan contable' });
    }
});

// routes/contador.js
router.get('/reportes-resumen', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const id_empresa = req.user.id_empresa;
        
        // Ejemplo: Obtener total de ingresos y egresos del mes actual
        const resumen = await pool.query(
            `SELECT 
                SUM(CASE WHEN pc.codigo LIKE '7%' THEN ad.haber - ad.debe ELSE 0 END) as ingresos,
                SUM(CASE WHEN pc.codigo LIKE '6%' THEN ad.debe - ad.haber ELSE 0 END) as gastos
             FROM asientos_detalle ad
             JOIN asientos_cabecera ac ON ad.id_asiento = ac.id
             JOIN plan_contable pc ON ad.id_cuenta = pc.id
             WHERE ac.id_empresa = ? AND ac.id_periodo = (SELECT id FROM periodos WHERE id_empresa = ? AND cerrado = 0 LIMIT 1)`,
            [id_empresa, id_empresa]
        );

        return res.json({ success: true, resumen: resumen[0] });
    } catch (error) {
        return res.json({ success: false });
    }
});

// routes/contador.js
router.get('/generar-ple-diario/:id_periodo', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const { id_periodo } = req.params;
        const id_empresa = req.user.id_empresa;

        // Consulta que une cabecera y detalle con formato PLE
        const filas = await pool.query(
            `SELECT 
                CONCAT(p.anio, LPAD(p.mes, 2, '0'), '00') as periodo_ple,
                ac.id as cuo,
                CONCAT('M', ac.id) as correlativo,
                pc.codigo as cuenta_codigo,
                ac.fecha_asiento,
                ac.glosa,
                ad.debe,
                ad.haber,
                ad.tipo_comprobante,
                ad.serie_comprobante,
                ad.numero_comprobante
             FROM asientos_detalle ad
             JOIN asientos_cabecera ac ON ad.id_asiento = ac.id
             JOIN periodos p ON ac.id_periodo = p.id
             JOIN plan_contable pc ON ad.id_cuenta = pc.id
             WHERE ac.id_empresa = ? AND ac.id_periodo = ?`,
            [id_empresa, id_periodo]
        );

        // Aquí se construiría la cadena de texto separada por pipes '|'
        let contenidoTxt = filas.map(f => {
            return `${f.periodo_ple}|${f.cuo}|${f.correlativo}|${f.cuenta_codigo}|...|${f.debe}|${f.haber}|1|`;
        }).join('\n');

        return res.json({ success: true, txt: contenidoTxt, nombreArchivo: `LE${req.user.ruc}${filas[0].periodo_ple}0501001111.txt` });
    } catch (error) {
        return res.json({ success: false });
    }
});

// routes/contador.js
router.get('/libro-mayor/:id_periodo', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const { id_periodo } = req.params;
        const id_empresa = req.user.id_empresa;

        const movimientos = await pool.query(
            `SELECT 
                pc.codigo as cuenta_codigo,
                pc.descripcion as cuenta_nombre,
                ac.fecha_asiento,
                ac.glosa,
                ad.debe,
                ad.haber,
                ad.tipo_comprobante,
                ad.serie_comprobante,
                ad.numero_comprobante
             FROM asientos_detalle ad
             JOIN asientos_cabecera ac ON ad.id_asiento = ac.id
             JOIN plan_contable pc ON ad.id_cuenta = pc.id
             WHERE ac.id_empresa = ? AND ac.id_periodo = ?
             ORDER BY pc.codigo ASC, ac.fecha_asiento ASC`,
            [id_empresa, id_periodo]
        );

        return res.json({ success: true, movimientos });
    } catch (error) {
        return res.json({ success: false });
    }
});

module.exports = router;