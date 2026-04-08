require('dotenv').config();
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session)
const passport = require('passport');
const fileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');

const { database } = require('./backend/keys.js');

const app = express();

const allowedOrigins = [
    'https://contabledev.developer-ideas.com',
    'http://localhost:5174', // Mantener para tus pruebas locales
    'http://localhost:5173'
];

app.use(cors({
    origin: function (origin, callback) {
            // Permitir peticiones sin origen (como Postman o apps móviles)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('El CORS de esta API no permite acceso desde este origen.'), false);
            }
            return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.options('*', cors());
app.use(fileUpload());

// Importar las estrategias de Passport
require('./backend/lib/passport.js');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ success: false, error: 'Se requiere un token para la autenticación.' });
    }
    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido.' });
    }
};

/**
 * Configuraciones
 */
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./backend/lib/handlebars.js')
}));
app.set('view engine', '.hbs');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Esto permite que al entrar a /uploads/imagen.jpg, Express busque en backend/public/uploads
app.use(express.static(path.join(__dirname, 'backend/public')));

// Middlewares
app.use(
    session({
        secret: 'c5a849594aebca8db1b9f4b5ec90aa4024137d9d28e0047f01c7244dfb8590da',
        resave: false,
        saveUninitialized: false,
        store: new MySQLStore(database),
        cookie: {
            maxAge: 1000 * 60 * 60 * 12
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Variables globales
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.users = req.user;
    next();
});

// Rutas de autenticación (públicas)
app.use('/api/auth', require('./backend/routes/authentication.js'));
app.use('/auth', require('./backend/routes/correos.js'));

// Rutas protegidas de la API (requieren token)
app.use('/api', verifyToken, require('./backend/routes/index.js'));
app.use('/api/auth', verifyToken, require('./backend/routes/usuarios.js'));

// Rutas protegidas de la API (rol = 'admin')
app.use('/api/admin', verifyToken, require('./backend/routes/admin/resumenes.js'));
app.use('/api/admin', verifyToken, require('./backend/routes/admin/empresas.js'));
app.use('/api/admin', verifyToken, require('./backend/routes/admin/reportes.js'));
app.use('/api/admin', verifyToken, require('./backend/routes/admin/usuarios.js'));
app.use('/api/admin', verifyToken, require('./backend/routes/admin/configuracion.js'));

// Rutas protegidas de la API (rol = 'contador')
app.use('/api/contador', verifyToken, require('./backend/routes/contador/resumenes.js'));
app.use('/api/contador', verifyToken, require('./backend/routes/contador/asientos.js'));
app.use('/api/contador', verifyToken, require('./backend/routes/contador/contable.js'));
app.use('/api/contador', verifyToken, require('./backend/routes/contador/entidades.js'));
app.use('/api/contador', verifyToken, require('./backend/routes/contador/periodos.js'));
app.use('/api/contador', verifyToken, require('./backend/routes/contador/bancos.js'));
app.use('/api/contador', verifyToken, require('./backend/routes/contador/sire.js'));

// Rutas protegidas de la API (rol = 'cliente')
app.use('/api/cliente', verifyToken, require('./backend/routes/cliente/resumenes.js'));
app.use('/api/cliente', verifyToken, require('./backend/routes/cliente/comprobantes.js'));
app.use('/api/cliente', verifyToken, require('./backend/routes/cliente/reportes.js'));
app.use('/api/cliente', verifyToken, require('./backend/routes/cliente/perfil.js'));

// Rutas protegidas de la API (rol = 'admin')
app.use('/apimovil/admin', verifyToken, require('./backend/routes/moviladmin/resumenes.js'));
app.use('/apimovil/admin', verifyToken, require('./backend/routes/moviladmin/configuracion.js'));
app.use('/apimovil/admin', verifyToken, require('./backend/routes/moviladmin/planes.js'));
app.use('/apimovil/admin', verifyToken, require('./backend/routes/moviladmin/usuarios.js'));
app.use('/apimovil/admin', verifyToken, require('./backend/routes/moviladmin/perfil.js'));

// Rutas protegidas de la API (rol = 'contador')
app.use('/apimovil/contador', verifyToken, require('./backend/routes/movilcontador/resumenes.js'));
app.use('/apimovil/contador', verifyToken, require('./backend/routes/movilcontador/entidades.js'));
app.use('/apimovil/contador', verifyToken, require('./backend/routes/movilcontador/bancos.js'));
app.use('/apimovil/contador', verifyToken, require('./backend/routes/movilcontador/sire.js'));
app.use('/apimovil/contador', verifyToken, require('./backend/routes/movilcontador/perfil.js'));

// Rutas protegidas de la API (rol = 'cliente')
app.use('/apimovil/cliente', verifyToken, require('./backend/routes/movilcliente/resumenes.js'));
app.use('/apimovil/cliente', verifyToken, require('./backend/routes/movilcliente/sire.js'));
app.use('/apimovil/cliente', verifyToken, require('./backend/routes/movilcliente/bancos.js'));
app.use('/apimovil/cliente', verifyToken, require('./backend/routes/movilcliente/perfil.js'));

app.use(express.static(path.resolve(__dirname, './backend/views')));
app.get('/api', (req, res) => {
    res.sendFile(path.resolve(__dirname, './backend/views', 'profile'));
});

// Iniciar el servidor
app.listen(app.get('port'), () => {
    console.log('Server en puerto', app.get('port'));
})