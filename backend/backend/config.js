// Archivo de configuración para variables de entorno sensibles
// En un entorno de producción, estos valores se obtendr\u00EDan de variables de entorno, no directamente del c\u00f3digo.

module.exports = {
    // Clave secreta para firmar y verificar tokens JWT
    // Se debe cambiar por una cadena aleatoria y muy segura en producci\u00f3n.
    JWT_SECRET: 'agroconecta-2025-a1b2c3d4e5f6g7h8',

    // Credenciales para el env\u00edo de correos electr\u00f3nicos con Nodemailer
    // Usar una cuenta de Gmail o un servicio de env\u00edo de correos (Mailgun, SendGrid).
    GMAIL_USER: 'j.portocarrero.jp@gmail.com',
    GMAIL_PASS: 'hlzulljsgqhwsdyo',
};
