const jwt = require('jsonwebtoken');

const isAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.json({ 
            message: 'Acceso denegado. Token no proporcionado.' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Verificamos si el rol guardado en el token es 'ADMINISTRADOR'
        if (decoded.rol !== 'ADMINISTRADOR' && decoded.rol !== 'ADMINISTRADOR') {
            return res.json({ 
                message: 'Acceso prohibido. Se requiere rol de ADMINISTRADOR.' 
            });
        }

        req.user = decoded; // Guardamos los datos del usuario en el request
        next(); // Continuamos a la siguiente función
    } catch (error) {
        res.json({ 
            message: 'Token no válido.' 
        });
    }
};

const isContador = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.json({ 
            message: 'Acceso denegado. Token no proporcionado.' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificamos si el rol guardado en el token es 'CONTADOR'
        if (decoded.rol !== 'CONTADOR') {
            return res.json({ 
                message: 'Acceso prohibido. Se requiere rol de CONTADOR.' 
            });
        }

        req.user = decoded; // Guardamos los datos del usuario en el request
        next(); // Continuamos a la siguiente función
    } catch (error) {
        res.json({ 
            message: 'Token no válido.' 
        });
    }
};

const isCliente = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.json({ 
            message: 'Acceso denegado. Token no proporcionado.' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificamos si el rol guardado en el token es 'CLIENTE'
        if (decoded.rol !== 'CLIENTE') {
            return res.json({ 
                message: 'Acceso prohibido. Se requiere rol de CLIENTE.' 
            });
        }

        req.user = decoded; // Guardamos los datos del usuario en el request
        next(); // Continuamos a la siguiente función
    } catch (error) {
        res.json({ 
            message: 'Token no válido.' 
        });
    }
};

module.exports = { isAdmin, isContador, isCliente };