const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "mail.developer-ideas.com", // Servidor de correo de tu dominio
    port: 465, // Puerto SSL para Banahosting
    secure: true, // true para puerto 465
    auth: {
        user: "soporte@developer-ideas.com", // O la cuenta que hayas creado
        pass: "406@Dev9666ideas",    // La contraseña que asignaste a esa cuenta
    },
    tls: {
        // Esto evita errores de certificado si el SSL del correo es auto-firmado
        rejectUnauthorized: false 
    }
});

transporter.verify().then(() => {
    console.log('✅ Servidor de correos listo');
});

module.exports = transporter;