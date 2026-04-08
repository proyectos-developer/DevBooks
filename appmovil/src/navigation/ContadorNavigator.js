import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// --- Pantallas del Contador ---
import ContadorDashboard from '../screens/contador/ContadorDashboard.js';
import LibroDiarioScreen from '../screens/contador/LibroDiarioScreen.js'; 
import DetalleAsientoScreen from '../screens/contador/DetalleAsientoScreen.js';
import BancosListScreen from '../screens/contador/BancosListScreen.js';
import ConciliacionBancariaScreen from '../screens/contador/ConciliacionBancariaScreen.js';
import SireListScreen from '../screens/contador/SireListScreen.js';
import SireDetalleScreen from '../screens/contador/SireDetalleScreen.js'
import PerfilScreen from '../screens/contador/PerfilScreen.js';
import ChangePasswordScreen from '../screens/contador/ChangePasswordScreen.js';
import NotificacionesScreen from '../screens/contador/NotificacionesScreen.js'
import SoporteScreen from '../screens/contador/SoporteScreen.js'
import AboutScreen from '../screens/contador/AboutScreen.js'
import TipoCambioScreen from '../screens/contador/TipoCambioScreen.js';
import EntidadesList from '../screens/contador/EntidadesList.js'; 
import DetallesEntidadScreen from '../screens/contador/DetallesEntidadScreen.js'; 
import EntidadMovimientosScreen from '../screens/contador/EntidadMovimientosScreen.js'; 

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Stack Principal (Inicio)
 * Gestiona el Dashboard y sus accesos directos principales.
 */
const InicioStack = () => (
    <Stack.Navigator screenOptions={{ 
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800' }
    }}>
        <Stack.Screen 
            name="ContadorDashboard" 
            component={ContadorDashboard} 
            options={{ headerShown: false }} 
        />
        <Stack.Screen 
            name="TipoCambio" 
            component={TipoCambioScreen} 
            options={{ title: 'Tipo de Cambio', headerShown: false }} 
        />
        <Stack.Screen 
            name="Entidades" 
            component={EntidadesList} 
            options={{ title: 'Entidades', headerShown: false }} 
        />
        <Stack.Screen 
            name="DetallesEntidad" 
            component={DetallesEntidadScreen} 
            options={{ title: 'Ficha de Entidad', headerShown: false }} 
        />
        <Stack.Screen 
            name="EntidadMovimientos" 
            component={EntidadMovimientosScreen} 
            options={{ title: 'Historial de Movimientos', headerShown: false }} 
        />
        {/* Se incluyen rutas de diario para navegación directa desde el dashboard */}
        <Stack.Screen 
            name="LibroDiarioList" 
            component={LibroDiarioScreen} 
            options={{ title: 'Libro Diario', headerShown: false }} 
        />
        <Stack.Screen 
            name="DetalleAsiento" 
            component={DetalleAsientoScreen} 
            options={{ title: 'Voucher Contable', headerShown: false }} 
        />
    </Stack.Navigator>
);

/**
 * Stack de Diario
 * Pestaña dedicada exclusivamente a la auditoría del Libro Diario.
 */
const DiarioStack = () => (
    <Stack.Navigator screenOptions={{ 
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800' }
    }}>
        <Stack.Screen 
            name="LibroDiarioMain" 
            component={LibroDiarioScreen} 
            options={{ title: 'Libro Diario', headerShown: false }} 
        />
        <Stack.Screen 
            name="DetalleAsientoMain" 
            component={DetalleAsientoScreen} 
            options={{ title: 'Voucher Contable', headerShown: false }} 
        />
    </Stack.Navigator>
);

const BancosStack = () => (
    <Stack.Navigator screenOptions={{ 
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800' }
    }}>
        <Stack.Screen 
            name="Bancos" 
            component={BancosListScreen} 
            options={{ title: 'Libro Diario', headerShown: false }} 
        />
        <Stack.Screen 
            name="Conciliacion" 
            component={ConciliacionBancariaScreen} 
            options={{ title: 'Conciliación Bancaria', headerShown: false }} 
        />
    </Stack.Navigator>
);

const SireStack = () => (
    <Stack.Navigator screenOptions={{ 
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800' }
    }}>
        <Stack.Screen 
            name="SireMain" 
            component={SireListScreen} 
            options={{ title: 'Propuestas SUNAT', headerShown: false }} 
        />
        <Stack.Screen 
            name="SireDetalle" 
            component={SireDetalleScreen} 
            options={{ title: 'Detalle de Comprobante', headerShown: false }} 
        />
    </Stack.Navigator>
);

/**
 * Stack de Perfil
 * Gestiona la configuración del usuario y seguridad.
 */
const PerfilStack = () => (
    <Stack.Navigator screenOptions={{ 
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff' 
    }}>
        <Stack.Screen 
            name="PerfilHome" 
            component={PerfilScreen} 
            options={{ title: 'Mi Perfil', headerShown: false }} 
        />
        <Stack.Screen 
            name="ChangePassword" 
            component={ChangePasswordScreen} 
            options={{ title: 'Seguridad', headerShown: false }} 
        />
        <Stack.Screen name="Notificaciones" component={NotificacionesScreen} options={{headerShown: false}} />
        <Stack.Screen name="Soporte" component={SoporteScreen} options={{headerShown: false}} />
        <Stack.Screen name="About" component={AboutScreen} options={{headerShown: false}} />
    </Stack.Navigator>
);

/**
 * Navigator Principal (Tabs)
 * Estructura de navegación inferior "Flotante".
 */
export default function ContadorNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'InicioTab') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Diario') iconName = focused ? 'journal' : 'journal-outline';
                    else if (route.name === 'Bancos') iconName = focused ? 'card' : 'card-outline';
                    else if (route.name === 'SIRE') iconName = focused ? 'cloud-download' : 'cloud-download-outline';
                    else if (route.name === 'PerfilTab') iconName = focused ? 'person-circle' : 'person-circle-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#10b981',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarLabelStyle: { 
                    fontSize: 11, 
                    fontWeight: '600', 
                    marginBottom: Platform.OS === 'ios' ? 0 : 10 
                },
                tabBarStyle: { 
                    borderTopWidth: 0, 
                    elevation: 20, 
                    backgroundColor: '#ffffff',
                    position: 'absolute', 
                    bottom: 20, 
                    left: 20, 
                    right: 20, 
                    borderRadius: 20, 
                    height: 70,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
                    shadowColor: '#000', 
                    shadowOpacity: 0.1, 
                    shadowRadius: 10,
                },
                headerShown: false
            })}
        >
            <Tab.Screen 
                name="InicioTab" 
                component={InicioStack} 
                options={{ title: 'Inicio' }} 
            />
            <Tab.Screen 
                name="Diario" 
                component={DiarioStack} 
                options={{ title: 'Diario' }} 
            />
            <Tab.Screen 
                name="Bancos" 
                component={BancosStack} 
                options={{ title: 'Bancos' }} 
            />
            <Tab.Screen name="SIRE" component={SireStack}  options={{headerShown: false}}/>
            <Tab.Screen 
                name="PerfilTab" 
                component={PerfilStack} 
                options={{ title: 'Perfil' }} 
            />
        </Tab.Navigator>
    );
}