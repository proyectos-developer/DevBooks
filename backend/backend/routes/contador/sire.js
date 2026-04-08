const express = require('express');
const router = express.Router();
const passport = require('passport');
 
const pool = require('../../database');
const { isContador } = require('../authmiddleware');

router.get('/sire-ventas-comparar/:id_periodo', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const { id_periodo } = req.params;
        const id_empresa = req.user.id_empresa;

        // 1. Obtener lo que SUNAT propone
        const propuesta = await pool.query(
            "SELECT * FROM sire_propuesta_ventas WHERE id_empresa = ? AND id_periodo = ?",
            [id_empresa, id_periodo]
        );

        // 2. Obtener lo que tú tienes en asientos_detalle (Ventas)
        const local = await pool.query(
            `SELECT ad.*, ac.fecha_asiento 
             FROM asientos_detalle ad
             JOIN asientos_cabecera ac ON ad.id_asiento = ac.id
             WHERE ac.id_empresa = ? AND ac.id_periodo = ? AND ac.tipo_libro = 'VENTAS'`,
            [id_empresa, id_periodo]
        );

        return res.json({ success: true, propuesta, local });
    } catch (error) {
        return res.json({ success: false });
    }
});

router.post('/sire-ventas-aceptar', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    const { id_periodo } = req.body;
    const id_empresa = req.user.id_empresa;

    if (!id_periodo) {
        return res.json({ success: false, message: "ID de periodo es requerido" });
    }

    try {
        // 1. Verificamos que el periodo exista y esté abierto
        const periodo = await pool.query(
            "SELECT * FROM periodos WHERE id = ? AND id_empresa = ? AND estado = 'ABIERTO'",
            [id_periodo, id_empresa]
        );

        if (periodo.length === 0) {
            throw new Error("El periodo no existe o ya está cerrado.");
        }

        // 2. Opcional: Validar que no existan discrepancias críticas antes de aceptar
        // Aquí podrías sumar los montos de la propuesta vs local y comparar
        const sumas = await pool.query(
            `SELECT 
                (SELECT SUM(monto_total) FROM sire_propuesta_ventas WHERE id_periodo = ? AND id_empresa = ?) as total_sunat,
                (SELECT SUM(haber) FROM asientos_detalle ad 
                 JOIN asientos_cabecera ac ON ad.id_asiento = ac.id 
                 WHERE ac.id_periodo = ? AND ac.id_empresa = ? AND ac.tipo_libro = 'VENTAS') as total_local`,
            [id_periodo, id_empresa, id_periodo, id_empresa]
        );

        const diferencia = Math.abs(sumas[0].total_sunat - sumas[0].total_local);
        
        // Si la diferencia es mayor a 1 sol (por redondeos), podrías lanzar un error o advertencia
        if (diferencia > 1.00) {
             // Dependiendo de tu lógica, puedes permitirlo o bloquearlo
             // throw new Error("Existen diferencias significativas entre SUNAT y Local.");
        }

        // 3. Marcamos el periodo como "ACEPTADO SIRE"
        // Actualizamos una columna específica para el flujo SIRE
        await pool.query(
            `UPDATE periodos 
             SET estado_sire = 'ACEPTADO', 
                 fecha_aceptacion_sire = NOW(),
                 usuario_sire = ?
             WHERE id = ? AND id_empresa = ?`,
            [req.user.id, id_periodo, id_empresa]
        );

        // 4. (Opcional) Bloqueamos los asientos locales para que no se puedan editar más
        await pool.query(
            `UPDATE asientos_cabecera 
             SET bloqueado = 1 
             WHERE id_periodo = ? AND id_empresa = ? AND tipo_libro = 'VENTAS'`,
            [id_periodo, id_empresa]
        );

        await pool.commit();
        return res.json({ 
            success: true, 
            message: "Propuesta de ventas aceptada y periodo conciliado correctamente." 
        });

    } catch (error) {
        console.error("Error en aceptar-propuesta:", error);
        return res.json({ 
            success: false, 
            message: error.message || "Error interno al procesar la aceptación" 
        });
    }
});

router.get('/sire-compras-comparar/:id_periodo', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    try {
        const { id_periodo } = req.params;
        const id_empresa = req.user.id_empresa;

        // 1. Obtener la propuesta de SUNAT para este periodo
        const propuesta = await pool.query(
            "SELECT * FROM sire_propuesta_compras WHERE id_empresa = ? AND id_periodo = ?",
            [id_empresa, id_periodo]
        );

        // 2. Obtener tus registros locales (Libro Compras)
        // Filtramos asientos_detalle que pertenezcan a asientos de tipo 'COMPRAS'
        const local = await pool.query(
            `SELECT ad.*, ac.fecha_asiento, ent.nombre_razon_social as proveedor
             FROM asientos_detalle ad
             JOIN asientos_cabecera ac ON ad.id_asiento = ac.id
             LEFT JOIN entidades ent ON ad.id_entidad = ent.id
             WHERE ac.id_empresa = ? AND ac.id_periodo = ? AND ac.tipo_libro = 'COMPRAS'`,
            [id_empresa, id_periodo]
        );

        return res.json({ success: true, propuesta, local });
    } catch (error) {
        console.log (error)
        return res.json({ success: false });
    }
});

router.post('/sire-compras-aceptar', passport.authenticate('jwt', { session: false }), isContador, async (req, res) => {
    const { id_periodo } = req.body;
    const id_empresa = req.user.id_empresa;

    if (!id_periodo) {
        return res.json({ success: false, message: "El ID del periodo es requerido." });
    }

    try {
        // 1. Verificar existencia del periodo y que pertenezca a la empresa del usuario
        const periodo = await pool.query(
            "SELECT estado_sire FROM periodos WHERE id = ? AND id_empresa = ?",
            [id_periodo, id_empresa]
        );

        if (periodo.length === 0) {
            throw new Error("El periodo seleccionado no existe.");
        }

        if (periodo[0].estado_sire === 'ACEPTADO') {
            throw new Error("Este periodo ya ha sido aceptado previamente.");
        }

        // 2. Actualizar el estado del periodo para Compras
        // Nota: Si usas la misma columna para ventas y compras, 
        // podrías considerar usar 'estado_sire_compras' si quieres manejarlos por separado.
        await pool.query(
            `UPDATE periodos 
             SET estado_sire = 'ACEPTADO', 
                 fecha_aceptacion_sire = NOW(),
                 usuario_sire = ?
             WHERE id = ? AND id_empresa = ?`,
            [req.user.id, id_periodo, id_empresa]
        );

        // 3. Bloquear los asientos contables de COMPRAS
        // Esto evita modificaciones manuales después de la conciliación con SUNAT
        const resultBloqueo = await pool.query(
            `UPDATE asientos_cabecera 
             SET bloqueado = 1 
             WHERE id_periodo = ? AND id_empresa = ? AND tipo_libro = 'COMPRAS'`,
            [id_periodo, id_empresa]
        );

        return res.json({ 
            success: true, 
            message: "Propuesta de compras aceptada con éxito.",
            asientos_bloqueados: resultBloqueo.affectedRows 
        });

    } catch (error) {
        console.error("Error en SIRE Compras Aceptar:", error);
        return res.json({ 
            success: false, 
            message: error.message || "Error interno al procesar la aceptación de compras." 
        });
    }
});

module.exports = router;