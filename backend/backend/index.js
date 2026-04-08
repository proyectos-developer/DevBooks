{/**const cors = require('cors')

const express = require ('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require ('connect-flash')
const session = require ('express-session')
const mysqlstore = require('express-mysql-session')
const passport = require('passport')

const { database } = require('./keys')

const app = express()
app.use(cors())
require ('./lib/passport')

/**Configuraciones
app.set('views', path.join(__dirname, 'views')); 
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs', 
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

//Middlewares
app.use(
    session({
        secret: 'faztmysqlnodesession',
        resave: false,
        saveUninitialized: false,
        store: new mysqlstore(database)
    })
)

app.use(flash())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(passport.initialize())
app.use(passport.session())

//Variables globales
app.use((req, res, next) => {
    app.locals.success = req.flash('success')
    app.locals.message = req.flash('message')
    app.locals.users = req.users
    next()
})
 
//Rutas
app.use(require('./routes'));
app.use(require('./routes/authentication'))

//app.use(require('./routes/sms.js'))
app.use(require('./routes/carros.js'))
app.use(require('./routes/tokens.js'))
app.use(require('./routes/conductores.js'))
app.use(require('./routes/viajeros.js'))
app.use(require('./routes/viajes.js'))
app.use(require('./routes/cupones.js'))
app.use(require('./routes/calificaciones.js'))
app.use(require('./routes/compartir.js'))

//Publico
app.use(express.static(path.join(__dirname, 'public')))**/}