import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

// Aquí importarás tus reducers cuando los crees
// import authReducer from './store/authSlice' 
import beginadmindata from './redux/beginadmindata.js'

/**admin */
import resumenesadmindata from './redux/admin/resumenesadmindata.js'
import empresasadmindata from './redux/admin/empresasadmindata.js'
import reportesadmindata from './redux/admin/reportesadmindata.js'
import usuariosadmindata from './redux/admin/usuariosadmindata.js'
import configadmindata from './redux/admin/configadmindata.js'

/**contador */
import resumenescontadordata from './redux/contador/resumenescontadordata.js'
import asientoscontadordata from './redux/contador/asientoscontadordata.js'
import contablecontadordata from './redux/contador/contablecontadordata.js'
import entidadescontadordata from './redux/contador/entidadescontadordata.js'
import periodoscontadordata from './redux/contador/periodoscontadordata.js'
import bancoscontadordata from './redux/contador/bancoscontadordata.js'
import sirecontadordata from './redux/contador/sirecontadordata.js'

/**cliente */
import resumenesclientedata from './redux/cliente/resumenesclientedata.js'
import comprobantesclientedata from './redux/cliente/comprobantesclientedata.js'
import reportesclientedata from './redux/cliente/reportesclientedata.js'
import perfilclientedata from './redux/cliente/perfilclientedata.js'

const store = configureStore({
    reducer: {
        beginadmin_data: beginadmindata,

        /**admin */
        resumenesadmin_data: resumenesadmindata,
        empresasadmin_data: empresasadmindata,
        reportesadmin_data: reportesadmindata,
        usuariosadmin_data: usuariosadmindata,
        configadmin_data: configadmindata,

        /**contador */
        resumenescontador_data: resumenescontadordata,
        asientoscontador_data: asientoscontadordata,
        contablecontador_data: contablecontadordata,
        entidadescontador_data: entidadescontadordata,
        periodoscontador_data: periodoscontadordata,
        bancoscontador_data: bancoscontadordata,
        sirecontador_data: sirecontadordata,

        /**cliente */
        resumenescliente_data: resumenesclientedata,
        comprobantescliente_data: comprobantesclientedata,
        reportescliente_data: reportesclientedata,
        perfilcliente_data: perfilclientedata
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false
    })
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)