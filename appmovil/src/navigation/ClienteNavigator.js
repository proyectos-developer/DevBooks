import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// --- Pantallas del Cliente ---
import ClienteDashboard from '../screens/cliente/ClienteDashboard.js';
import MisReportesScreen from '../screens/cliente/MisReportesScreen.js'; 
import DetalleReporteScreen from '../screens/cliente/DetalleReporteScreen.js'
import MisBancosScreen from '../screens/cliente/MisBancosScreen.js'; 
import PerfilScreen from '../screens/cliente/PerfilScreen.js'; 
import ChangePasswordScreen from '../screens/cliente/ChangePasswordScreen.js';
import NotificacionesScreen from '../screens/contador/NotificacionesScreen.js';
import SoporteScreen from '../screens/contador/SoporteScreen.js';
import AboutScreen from '../screens/contador/AboutScreen.js';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Configuración de Stacks para navegación interna
const screenOptions = {
    headerShown: false,
    animation: 'fade_from_bottom'
};

const InicioStack = () => (
    <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="ClienteDashboard" component={ClienteDashboard} />
        <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
    </Stack.Navigator>
);

const ReportesStack = () => (
    <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="MisReportes" component={MisReportesScreen} />
        <Stack.Screen name="DetalleReporte" component={DetalleReporteScreen} />
    </Stack.Navigator>
);

const PerfilStack = () => (
    <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="PerfilHome" component={PerfilScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="Soporte" component={SoporteScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
);

export default function ClienteNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'InicioTab') iconName = focused ? 'speedometer' : 'speedometer-outline';
                    else if (route.name === 'ReportesTab') iconName = focused ? 'document-text' : 'document-text-outline';
                    else if (route.name === 'BancosTab') iconName = focused ? 'wallet' : 'wallet-outline';
                    else if (route.name === 'PerfilTab') iconName = focused ? 'person' : 'person-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#10b981', // Verde Esmeralda de DevBooks
                tabBarInactiveTintColor: '#94a3b8',
                tabBarLabelStyle: { 
                    fontSize: 10, 
                    fontWeight: '700', 
                    marginBottom: Platform.OS === 'ios' ? 0 : 12 
                },
                tabBarStyle: { 
                    position: 'absolute', 
                    bottom: Platform.OS === 'ios' ? 30 : 20, 
                    left: 20, 
                    right: 20, 
                    borderRadius: 25, 
                    height: 75,
                    backgroundColor: '#ffffff',
                    borderTopWidth: 0, 
                    elevation: 15,
                    shadowColor: '#000',
                    shadowOpacity: 0.1, 
                    shadowRadius: 15,
                    paddingBottom: Platform.OS === 'ios' ? 25 : 0,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen 
                name="InicioTab" 
                component={InicioStack} 
                options={{ title: 'Resumen' }} 
            />
            <Tab.Screen 
                name="ReportesTab" 
                component={ReportesStack} 
                options={{ title: 'Reportes' }} 
            />
            <Tab.Screen 
                name="BancosTab" 
                component={MisBancosScreen} 
                options={{ title: 'Mis Bancos' }} 
            />
            <Tab.Screen 
                name="PerfilTab" 
                component={PerfilStack} 
                options={{ title: 'Cuenta' }} 
            />
        </Tab.Navigator>
    );
}