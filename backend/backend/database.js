const mysql = require('mysql');
const { promisify } = require('util');

const { database } = require('./keys');

// Crea un pool de conexiones para manejar múltiples conexiones de forma eficiente.
const pool = mysql.createPool(database);

// Intenta establecer una conexión para verificar el estado de la base de datos al inicio.
pool.getConnection((err, connection) => {
    // Si hay un error al obtener la conexión...
    if (err) {
        switch (err.code) {
            case 'PROTOCOL_CONNECTION_LOST':
                console.error('ERROR: La conexión con la base de datos se cerró inesperadamente.');
                break;a
            case 'ER_CON_COUNT_ERROR':
                console.error('ERROR: La base de datos tiene demasiadas conexiones abiertas.');
                break;
            case 'ECONNREFUSED':
                console.error('ERROR: La conexión a la base de datos fue rechazada. Verifique las credenciales y el estado del servidor.');
                break;
            case 'ER_ACCESS_DENIED_ERROR':
                console.error('ERROR: Acceso denegado. Verifique las credenciales de la base de datos.');
                break;
            default:
                console.error('ERROR de conexión a la base de datos:', err);
        }
        return;
    }

    // Si la conexión es exitosa...
    if (connection) {
        connection.release();
        console.log('CONEXIÓN EXITOSA: La base de datos de ContableDev está conectada.');
    }
});

// Promisifica el método de consulta del pool para poder usar async/await.
pool.query = promisify(pool.query);

// Exporta el pool de conexiones para que pueda ser utilizado en otras partes de la aplicación.
module.exports = pool;
