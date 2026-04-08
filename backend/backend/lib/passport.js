const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const pool = require('../database');
const helpers = require('./helpers');

// Asegúrate de que el secreto de JWT esté definido
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    process.exit(1);
}

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
};

// Estrategia de autenticación para el inicio de sesión
passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        // 1. Buscar al usuario por email o celular
        const rows = await pool.query(
            'SELECT * FROM usuarios WHERE email = ? OR celular = ?',
            [email, email]
        );

        if (rows.length === 0) {
            return done(null, false, { message: 'Credenciales incorrectas.' });
        }

        const user = rows[0];

        // 2. Verificar si la cuenta del usuario está activa
        if (!user.estado === 'activo') {
            return done(null, false, { message: 'Tu cuenta está inactiva. Por favor, contacta al soporte.' });
        }

        // 3. Validar la contraseña
        const validPassword = await helpers.matchPassword(password, user.password_hash);

        if (validPassword) {
            delete user.password_hash; // Elimina la contraseña antes de generar el token o la sesión

            // 4. Generar el JWT
            const payload = {
                id_usuario: user.id,
                rol: user.rol,
                celular: user.celular
                // Puedes añadir más datos aquí si los necesitas en el token
            };
            const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' }); // Token válido por 1 hora

            // Se devuelve el usuario y el token
            return done(null, { user: user, token: token }, req.flash('success', '¡Bienvenido de nuevo!'));

        } else {
            return done(null, false, { message: 'Credenciales incorrectas.' });
        }

    } catch (error) {
        return done(error);
    }
}));
 
// Estrategia de registro de usuarios
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        const { celular, rol, nombre_completo, dni } = req.body;

        // 1. Verificar si el usuario o correo ya existen
        const existingUsers = await pool.query('SELECT id FROM usuarios WHERE email = ? OR celular = ?',
            [email, email]);

        if (existingUsers.length > 0) {
            return done(null, false, { message: 'El correo electrónico, nombre_completo de usuario o teléfono ya están registrados.' });
        }

        // 2. Hashear la contraseña
        const hashedPassword = await helpers.encryptPassword(password);

        // 3. Insertar nuevo usuario
        const newUser = {
            nombre_completo,
            email,
            password_hash: hashedPassword,
            celular,
            dni,
            rol: rol || 'admin',
            estado: "activo"
        };
        
        const result = await pool.query('INSERT INTO usuarios SET ?', [newUser]);
        const newUserId = result.insertId;

        // 4. Recuperar el usuario recién creado
        const newUserRows = await pool.query('SELECT id, nombre_completo, estado, email, celular, rol, dni  FROM usuarios WHERE id = ?', [newUserId]);
        const user = newUserRows[0];

        // 5. Llamar a 'done'
        return done(null, user);

    } catch (error) {
        return done(error);
    }
}));

// Serializar y deserializar para sesiones de Passport (solo se usa si no se usa JWT)
passport.serializeUser((user, done) => {
    // Almacenamos solo el id_usuario en la sesión
    done(null, user.id_usuario);
});

passport.deserializeUser(async (id, done) => {
    try {
        const rows = await pool.query('SELECT id, email, rol, estado, nro_telefono, nombre FROM usuarios WHERE id = ?', [id]);
        if (rows.length > 0) {
            done(null, rows[0]);
        } else {
            done(null, false);
        }
    } catch (err) {
        done(err, null);
    }
});

// Estrategia JWT (opcional, si se desea usarla en lugar de sesiones)
passport.use(new JwtStrategy(jwtOptions, (jwt_payload, done) => {
    // Aquí puedes buscar el usuario en la base de datos si es necesario
    // Por ahora, solo devolvemos el payload del token
    done(null, jwt_payload);
}));
