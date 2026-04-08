// Importaciones de módulos
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const transporter = require('./mailer'); // Importamos el transportador

// Asegúrate de que tu helper de encriptación de contraseñas está en uso
const helpers = require('../lib/helpers');

const pool = require('../database');
const bcrypt = require('bcryptjs');

// --- Configuración de la Estrategia de Passport ---

const JWT_SECRET = '9afa5b4f0b0cfc53694ae8e5d061f753835240e648b9c08541a58421accb87eb';
if (!JWT_SECRET) {
    process.exit(1);
}

router.post('/register', async (req, res) => {
    const { 
        ruc, razon_social, nombre_comercial, direccion, 
        nombre, apellido, email, password, rol          
    } = req.body;

    try {
        // 1. Validar si el RUC ya existe
        const empresaExistente = await pool.query('SELECT id FROM empresas WHERE ruc = ?', [ruc]);
        if (empresaExistente.length > 0) {
            return res.json({ success: false, mensaje: 'Este RUC ya está registrado en la plataforma.' });
        }

        // 2. Validar si el Email ya existe
        const usuarioExistente = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (usuarioExistente.length > 0) {
            return res.json({ success: false, mensaje: 'El correo electrónico ya está en uso.' });
        }

        // 3. Insertar la Empresa (Tenant)
        const queryEmpresa = `
            INSERT INTO empresas (ruc, razon_social, nombre_comercial, direccion, estado_sunat) 
            VALUES (?, ?, ?, ?, 'ACTIVO')
        `;
        const resEmpresa = await pool.query(queryEmpresa, [ruc, razon_social, nombre_comercial, direccion]);
        const id_empresa = resEmpresa.insertId;

        // 4. Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Insertar el Usuario Maestro (Por defecto ADMINISTRADOR)
        const userRol = rol || 'ADMINISTRADOR';
        const queryUsuario = `
            INSERT INTO usuarios (id_empresa, nombre, apellido, email, password, rol, primer_ingreso, estado) 
            VALUES (?, ?, ?, ?, ?, ?, 0, 1)
        `;
        
        const resUsuario = await pool.query(queryUsuario, [
            id_empresa, nombre, apellido, email, hashedPassword, userRol
        ]);
        const id_usuario = resUsuario.insertId;

        // 6. Generar Token JWT
        const token = jwt.sign(
            { id: id_usuario, id_empresa, rol: userRol },
            process.env.JWT_SECRET,
            { expiresIn: '365d' }
        );

        return res.json({
            success: true,
            mensaje: 'Cuenta empresarial creada con éxito.',
            token,
            user: {
                id: id_usuario,
                id_empresa: id_empresa,
                nombre,
                apellido,
                email,
                rol: userRol,
                primerIngreso: false
            }
        });

    } catch (error) {
        console.error('Error en el registro DevBooks:', error);
        return res.json({
            success: false,
            mensaje: 'Error al procesar el registro: ' + error.message
        });
    } 
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar al usuario con JOIN a empresa para traer el nombre de la empresa si es necesario
        const rows = await pool.query(
            `SELECT u.*, e.razon_social as empresa_nombre 
             FROM usuarios u 
             INNER JOIN empresas e ON u.id_empresa = e.id 
             WHERE u.email = ?`, 
            [email]
        );

        if (rows.length === 0) {
            return res.json({ 
                success: false, 
                mensaje: 'El correo electrónico no está registrado.' 
            });
        }

        const user = rows[0];

        // 2. Verificar estado de la cuenta (TINYINT 1=Activo, 0=Inactivo)
        if (user.estado === 0) {
            return res.json({ 
                success: false, 
                mensaje: 'Tu cuenta está deshabilitada. Contacta al administrador.' 
            });
        }

        // 3. Comparar contraseña
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.json({ 
                success: false, 
                mensaje: 'Contraseña incorrecta.' 
            });
        }

        // 4. Generar Token con el id_empresa (Clave para el filtrado Multi-tenant)
        const tokenPayload = {
            id: user.id,
            id_empresa: user.id_empresa,
            rol: user.rol
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: '365d' // 30 días es un estándar equilibrado entre seguridad y UX
        });

        // 5. Respuesta para el AuthProvider de la App Móvil
        return res.json({
            success: true,
            mensaje: 'Acceso concedido',
            token: token,
            user: {
                id: user.id,
                id_empresa: user.id_empresa,
                empresa: user.empresa_nombre,
                nombre: user.nombre,
                apellido: user.apellido,
                rol: user.rol,
                email: user.email,
                primerIngreso: user.primer_ingreso === 1
            }
        });

    } catch (error) {
        console.error('Error en login DevBooks:', error);
        return res.json({ 
            success: false, 
            mensaje: 'Error interno en el servidor.' 
        });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // 1. Verificar usuario en la tabla 'usuarios' (estado 1 = activo)
        const rows = await pool.query(
            'SELECT id, nombre, email FROM usuarios WHERE email = ? AND estado = 1', 
            [email]
        );

        // Seguridad: Siempre respondemos éxito para evitar enumeración de cuentas
        if (rows.length === 0) {
            return res.json({
                success: true,
                mensaje: 'Si el correo está registrado, recibirás instrucciones en breve.' 
            });
        }

        const user = rows[0];

        // 2. Generar Token de recuperación (JWT) - Expira en 1 hora
        const resetToken = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } 
        );

        // 3. URL de recuperación (Apunta a tu web de Developer Ideas)
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // 5. Enviar el correo con branding de DevBooks
        await transporter.sendMail({
            from: '"Soporte DevBooks" <soporte@developer-ideas.com>',
            to: email,
            subject: "Recuperación de Contraseña - DevBooks",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; padding: 40px; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #0f172a; margin: 0; font-size: 24px;">Dev<span style="color: #10b981;">Books</span></h1>
                        <p style="color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Gestión Contable Cloud</p>
                    </div>
                    <h2 style="color: #1e293b; font-size: 20px;">Hola, ${user.nombre}</h2>
                    <p style="color: #475569; line-height: 1.6;">Recibimos una solicitud para restablecer la contraseña de tu cuenta empresarial en <strong>DevBooks</strong>.</p>
                    <p style="color: #475569; line-height: 1.6;">Haz clic en el botón de abajo para elegir una nueva contraseña:</p>
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${resetUrl}" style="background-color: #0f172a; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                            Restablecer Contraseña
                        </a>
                    </div>
                    <p style="font-size: 0.8rem; color: #94a3b8; text-align: center;">
                        Este enlace es válido por <strong>1 hora</strong>. Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.
                    </p>
                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;">
                    <p style="font-size: 0.75rem; color: #cbd5e1; text-align: center;">
                        &copy; 2026 Developer Ideas E.I.R.L. <br>
                        Lima, Perú.
                    </p>
                </div>
            `,
        });

        return res.json({
            success: true,
            token: resetToken,
            mensaje: 'Se ha enviado un enlace de recuperación a tu correo electrónico.'
        });

    } catch (error) {
        console.error('Error en forgot-password DevBooks:', error);
        return res.json({ 
            success: false, 
            mensaje: 'Error al procesar la solicitud en el servidor.' 
        });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    try {
        // 1. Verificar y decodificar el token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id; // Viene del payload generado en forgot-password

        // 2. Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Actualizar en MySQL (usando el campo 'id' de tu tabla)
        // Marcamos primer_ingreso = 0 porque el usuario ya está definiendo su propia clave
        const result = await pool.query(
            'UPDATE usuarios SET password = ?, primer_ingreso = 0 WHERE id = ?', 
            [hashedPassword, userId]
        );

        if (result.affectedRows === 0) {
            return res.json({
                success: false,
                mensaje: 'No se pudo encontrar el usuario asociado a este enlace.'
            });
        }

        return res.json({
            success: true,
            mensaje: 'Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión.'
        });

    } catch (error) {
        console.error('Error en reset-password Contable:', error);
        
        const mensajeError = error.name === 'TokenExpiredError' 
            ? 'El enlace ha expirado. Por seguridad, solicita uno nuevo.' 
            : 'El enlace es inválido o ya fue utilizado.';

        return res.json({
            success: false,
            mensaje: mensajeError
        });
    }
});

router.post('/cambiar-clave-obligatorio', async (req, res) => {
    // Usamos 'id' para coincidir con tu esquema de base de datos
    const { id, password } = req.body;

    try {
        // 1. Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Actualizar contraseña y desactivar el flag de primer ingreso (TINYINT 0)
        const query = `
            UPDATE usuarios 
            SET password = ?, primer_ingreso = 0 
            WHERE id = ?
        `;
        
        const result = await pool.query(query, [hashedPassword, id]);

        if (result.affectedRows === 0) {
            return res.json({
                success: false,
                mensaje: 'Usuario no encontrado o no se pudo actualizar.'
            });
        }

        return res.json({
            success: true,
            mensaje: 'Contraseña actualizada con éxito. Bienvenido al sistema.'
        });

    } catch (error) {
        console.error('Error en cambio de clave obligatorio:', error);
        return res.json({ 
            success: false, 
            mensaje: 'Error interno en el servidor de Developer Ideas.' 
        });
    }
});

module.exports = router;