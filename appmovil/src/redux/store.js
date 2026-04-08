import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import begindata from '../redux/begindata'

/**admin */
import resumenesadmindata from '../redux/admin/resumenesadmindata'
import configuracionadmindata from '../redux/admin/configuracionadmindata'
import contableadmindata from '../redux/admin/contableadmindata'
import usuariosadmindata from '../redux/admin/usuariosadmindata'

/**contador */
import resumenescontadordata from '../redux/contador/resumenescontadordata'
import entidadescontadordata from '../redux/contador/entidadescontadordata'
import bancoscontadordata from '../redux/contador/bancoscontadordata'
import sirecontadordata from '../redux/contador/sirecontadordata.js'
import perfilcontadordata from '../redux/contador/perfilcontadordata.js'

/**cliente */
import resumenesclientedata from '../redux/cliente/resumenesclientedata'
import reportesclientedata from '../redux/cliente/reportesclientedata'
import bancosclientedata from '../redux/cliente/bancosclientedata'
import perfilclientedata from '../redux/cliente/perfilclientedata.js'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['begin_data'], 
  blacklist: [
    'resumenesadmin_data', 'configuracionadmin_data', 'contableadmin_data', 'usuariosadmin_data',
    'resumenescontador_data', 'entidadescontador_data', 'bancoscontador_data', 'sirecontador_data',
    'perfilcontador_data',
    'resumenescliente_data', 'reportescliente_data', 'bancoscliente_data',
  ] 
};

const rootReducer = combineReducers({
  begin_data: begindata,

  /**admin */
  resumenesadmin_data: resumenesadmindata,
  configuracionadmin_data: configuracionadmindata,
  contableadmin_data: contableadmindata,
  usuariosadmin_data: usuariosadmindata,

  /**contador */
  resumenescontador_data: resumenescontadordata,
  entidadescontador_data: entidadescontadordata,
  bancoscontador_data: bancoscontadordata,
  sirecontador_data: sirecontadordata,
  perfilcontador_data: perfilcontadordata,

  /**cliente */
  resumenescliente_data: resumenesclientedata,
  reportescliente_data: reportesclientedata,
  bancoscliente_data: bancosclientedata,
  perfilcliente_data: perfilclientedata,

});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,

  /**instructor */
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);