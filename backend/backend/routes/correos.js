const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const { JWT_SECRET, GMAIL_USER, GMAIL_PASS } = require('../config.js');
const express = require('express');
const router = express.Router();
const pool = require('../database');


// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Obligatorio para puerto 465
    auth: {
        user: "j.portocarrero.jp@gmail.com", // Tu cuenta de Gmail
        pass: "hlzulljsgqhwsdyo"   // CONTRASEÑA DE APLICACIÓN (No la normal)
    },
    tls: {
        // Esto permite que Node.js confíe en certificados que no están 
        // validados localmente, útil en algunos servidores de Banahosting
        rejectUnauthorized: false 
    }
});
/**const transporter = nodemailer.createTransport({
    host: "mail.developer-ideas.com",
    port: 465,
    secure: true, // true para puerto 465
    auth: {
        user: "agro@developer-ideas.com",
        pass: "406@Dev9666ideas" // Recomiendo usar variables de entorno
    },tls: {
        rejectUnauthorized: false
    }
});**/

/**servidor
const templatePath = path.join(__dirname, 'template');

const handlebarOptions = {
    viewEngine: {
        extName: '.hbs',
        partialsDir: templatePath,
        defaultLayout: false,
    },
    viewPath: templatePath,
    extName: '.hbs',
}; */
// PCConfiguración del motor de plantillas de Handlebars
const handlebarOptions = {
    viewEngine: {
        extName: '.hbs',
        partialsDir: path.resolve('../backend/backend/routes/template/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('../backend/backend/routes/template/'),
    extName: '.hbs',
};
transporter.use('compile', hbs(handlebarOptions));

router.post('/registro-exitoso', async (req, res) => {
    const { nombre, correoDestino } = req.body;

    const mailOptions = {
        from: '"Agro Developer-Ideas" <agro@developer-ideas.com>',
        to: correoDestino + ', agro@developer-ideas.com',
        subject: '¡Registro Exitoso! - Bienvenido',
        template: 'email-registro', // Nombre del archivo .hbs
        context: {
            nombre: nombre,
            correo: correoDestino
        }
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Correo de bienvenida enviado con éxito' });
    } catch (error) {
        console.error("Error enviando correo:", error);
        res.status(500).json({ error: error });
    }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Envía un correo de recuperación de contraseña con un token JWT.
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
    
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email y token son requeridos' });
    }
    
    // Verifica si el usuario existe por su correo electrónico
    const users = await pool.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);

    if (users.length === 0) {
        return res.json({ 
        success: false, 
        error: 'No se encontró un usuario con ese correo electrónico.' 
        });
    }

    const user = users[0];
    const token = jwt.sign({ id: user.id_usuario }, JWT_SECRET, { expiresIn: '1h' }); // Token expira en 1 hora

    const mailOptions = {
        from: '"Soporte Agro" <agro@developer-ideas.com>',
        to: email,
        subject: 'Restablecer tu contraseña - Developer Ideas',
        template: 'forgot_password', // Nombre del archivo .hbs
        context: {
            token: token // Este es el valor que req.body recibe
        }
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Correo de recuperación enviado con éxito' });
    } catch (error) {
        console.error('Error al enviar correo:', error);
        res.status(500).json({ error: 'Error interno al enviar el correo' });
    }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Envía un correo de recuperación de contraseña con un token JWT.
 * @access  Public
 */
router.post('/defensoria-legal', async (req, res) => {
    try {
        const mailOptions = {
            from: 'no-replay@defensoria-legal.com',
            to: 'LEGALCONTRATACION@GMAIL.COM; j.portocarrero.jp@gmail.com',
            subject: 'ASUNTO: INICIO PROCEDIMIENTO SANCIONADOR OECE-  SERVICIO DEFENSA LEGAL PUBLICIDAD',
            template: 'correo_legal_dos',
            context: {
                // Estos nombres deben coincidir con el 'cid' de los attachments
                miLogo: 'cid:logo_legal',
            },
            attachments: [
                {
                    filename: 'defensoria_legal.jpeg',
                    path: path.join(__dirname, './template/defensoria_legal.jpeg'),
                    cid: 'logo_legal' // mismo nombre que en el context
                },
            ]
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Correo enviado con éxito.' });

    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});



module.exports = router;
