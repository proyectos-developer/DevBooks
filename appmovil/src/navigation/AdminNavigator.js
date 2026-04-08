import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Pantallas
import AdminDashboard from '../screens/admin/AdminDashboard';
import DetalleAsientoScreen from '../screens/admin/DetalleAsientoScreen.js';
import LibroDiarioScreen from '../screens/admin/LibroDiarioScreen.js';
import EmpresaConfig from '../screens/admin/EmpresaConfig';
import PlanContableList from '../screens/admin/PlanContableList';
import UsuariosList from '../screens/admin/UsuariosList';
import PerfilScreen from '../screens/admin/PerfilScreen';
import ChangePasswordScreen from '../screens/admin/ChangePasswordScreen.js'; // Nueva Pantalla

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 1. Stack de Dashboard
const DashboardStack = () => (
    <Stack.Navigator screenOptions={{ 
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800' }
    }}>
        <Stack.Screen 
            name="AdminDashboard" 
            component={AdminDashboard} 
            options={{ title: 'Resumen Global', headerShown: false }} 
        />
        <Stack.Screen 
            name="DetalleAsiento" 
            component={DetalleAsientoScreen} 
            options={{ title: 'Detalle del Asiento', headerShown: false }} 
        />
        <Stack.Screen 
            name="LibroDiario" 
            component={LibroDiarioScreen} 
            options={{ title: 'Libro Diario Completo', headerShown: false }} 
        />
    </Stack.Navigator>
);

// 2. Stack de Usuarios
const UsuariosStack = () => (
    <Stack.Navigator screenOptions={{ 
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff' 
    }}>
        <Stack.Screen 
            name="UsuariosList" 
            component={UsuariosList} 
            options={{ title: 'Gestión de Personal', headerShown: false }} 
        />
    </Stack.Navigator>
);

// 3. Stack de Perfil (Para permitir navegación a Seguridad)
const PerfilStack = () => (
    <Stack.Navigator screenOptions={{ 
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff' 
    }}>
        <Stack.Screen 
            name="PerfilScreen" 
            component={PerfilScreen} 
            options={{ title: 'Mi Perfil', headerShown: false }} 
        />
        <Stack.Screen 
            name="ChangePassword" 
            component={ChangePasswordScreen} 
            options={{ title: 'Seguridad', headerShown: false }} 
        />
    </Stack.Navigator>
);

export default function AdminNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'DashboardTab') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    else if (route.name === 'Mi Empresa') iconName = focused ? 'business' : 'business-outline';
                    else if (route.name === 'Plan Contable') iconName = focused ? 'list' : 'list-outline';
                    else if (route.name === 'UsuariosTab') iconName = focused ? 'people' : 'people-outline';
                    else if (route.name === 'PerfilTab') iconName = focused ? 'person-circle' : 'person-circle-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#10b981',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginBottom: Platform.OS === 'ios' ? 0 : 10,
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
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                },
                headerShown: false
            })}
        >
            <Tab.Screen 
                name="DashboardTab" 
                component={DashboardStack} 
                options={{ title: 'Dashboard' }}
            />
            <Tab.Screen 
                name="Mi Empresa" 
                component={EmpresaConfig} 
                options={{ title: 'Configuración' }}
            />
            <Tab.Screen 
                name="Plan Contable" 
                component={PlanContableList} 
                options={{ title: 'PCGE' }}
            />
            <Tab.Screen 
                name="UsuariosTab" 
                component={UsuariosStack} 
                options={{ title: 'Usuarios' }}
            />
            <Tab.Screen 
                name="PerfilTab" 
                component={PerfilStack} 
                options={{ title: 'Mi Perfil' }}
            />
        </Tab.Navigator>
    );
}