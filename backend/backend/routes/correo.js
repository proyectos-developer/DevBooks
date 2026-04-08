require('dotenv').config()
const nodemailer = require('nodemailer');
const router = express.Router(); // Si estás usando express.Router()

const app = express();
app.use(express.json()); // Middleware para parsear cuerpos de solicitud JSON

// --- Configuración de Nodemailer ---
// Crea un "transporter" que reutilizarás para enviar correos.
// Es buena práctica crearlo una vez y reutilizarlo.
const transporter = nodemailer.createTransport({
    service: 'gmail', // Por ejemplo, para Gmail. Puedes usar 'smtp.host.com' para otros proveedores.
    auth: {
        user: process.env.EMAIL_USER, // Tu dirección de correo electrónico
        pass: process.env.EMAIL_PASS  // Tu contraseña o contraseña de aplicación
    },

    // Si tienes problemas de conexión (ej. SSL/TLS), podrías necesitar opciones como:
    // tls: {
    //     rejectUnauthorized: false
    // }
});

// --- Ruta POST para enviar el correo de recuperación de contraseña ---
router.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body; // Obtiene el correo electrónico del cuerpo de la solicitud

    // --- Validación básica del correo electrónico ---
    if (!email) {
        return res.status(400).json({ success: false, message: 'El correo electrónico es requerido.' });
    }

    // --- Lógica para buscar el usuario y generar un token de restablecimiento ---
    // En una aplicación real:
    // 1. Busca el usuario en tu base de datos por 'email'.
    // 2. Si el usuario existe, genera un token JWT de restablecimiento de contraseña.
    //    Este token debe tener una expiración corta (ej. 15-30 minutos)
    //    y debe ser almacenado (hasheado) en la base de datos junto al usuario
    //    para poder verificarlo e invalidarlo más tarde.
    // 3. Construye el enlace de restablecimiento con el token:
    //    const resetLink = `https://tuapp.com/reset-password?token=${resetToken}`;
    // Por seguridad, si el email no existe, no debes informar al frontend para evitar enumeración de usuarios.
    // En su lugar, responde de forma genérica como si el correo se hubiera enviado.

    // --- Ejemplo simplificado sin DB o JWT para ilustrar el envío de correo ---
    // En un caso real, 'resetToken' y 'resetLink' serían generados aquí.
    const resetToken = process.env.JWT_SECRET; // Simulado
    const resetLink = `http://localhost:5173/cuenta/reset-password/${resetToken}`; // URL de tu frontend


    // --- Opciones del Correo Electrónico ---
    const mailOptions = {
        from: `AgroConecta <${process.env.EMAIL_USER}>`, // Remitente (puede ser diferente a EMAIL_USER, pero debe estar autorizado)
        to: email,                                       // Destinatario
        subject: 'Restablece tu contraseña de AgroConecta', // Asunto
        html: `
            <p>Hola,</p>
            <p>Has solicitado un restablecimiento de contraseña para tu cuenta en AgroConecta.</p>
            <p>Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:</p>
            <p><a href="${resetLink}">Restablecer Contraseña</a></p>
            <p>Este enlace expirará en <b>15 minutos</b>. Si no solicitaste esto, por favor ignora este correo.</p>
            <p>Gracias,</p>
            <p>El equipo de AgroConecta</p>
        `
        // También puedes usar 'text' para una versión de texto plano del correo
    };

    // --- Envío del Correo ---
    try {
        console.log(`Intentando enviar correo a: ${email}`);
        let info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado: %s', info.messageId);
        // console.log('Vista previa de URL del correo (si usas Ethereal): %s', nodemailer.getTestMessageUrl(info));

        // Por seguridad, siempre responde con éxito aquí, incluso si el email no existe en la DB.
        return res.status(200).json({
            success: true,
            message: 'Si el correo electrónico está registrado, recibirás un enlace de restablecimiento. Revisa tu bandeja de entrada.'
        });

    } catch (error) {
        console.error('Error al enviar el correo:', error);
        // No expongas el error real al usuario final por seguridad.
        return res.status(500).json({ success: false, message: 'Error interno del servidor al intentar enviar el correo.' });
    }
});

// Puedes exportar el router o usar app.use si esto está en tu archivo principal

module.exports = router