import React from 'react';
import 'react-native-get-random-values';
import 'react-native-gesture-handler'; 
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, View } from 'react-native';

// Redux y Contexto
import { store, persistor } from './src/redux/store.js';
import { AuthProvider, useAuth } from './src/context/AuthContext.js';

// Pantallas de Autenticación
import { WelcomeScreen, LoginScreen, ForgotPasswordScreen, RegisterScreen } from './src/screens/auth.js';

// Navegadores por Rol para DevBooks
import AdminNavigator from './src/navigation/AdminNavigator.js';
import ContadorNavigator from './src/navigation/ContadorNavigator.js'; // El perfil principal de gestión
import ClienteNavigator from './src/navigation/ClienteNavigator.js';   // El dueño de la empresa (Tenant)

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const { user, isLoading } = useAuth();
    
    // Pantalla de carga con el color verde de DevBooks (#10b981)
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user === null ? (
                /* Flujo Público: No autenticado */
                <Stack.Group screenOptions={{ animation: 'fade' }}>
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                </Stack.Group>
            ) : (
                /* Flujo Privado: Segmentado por Roles de tu db.sql */
                <Stack.Screen name="MainStack">
                    {(props) => {
                        switch (user.rol) { 
                            case 'ADMINISTRADOR': 
                                return <AdminNavigator {...props} />;
                            case 'CONTADOR':       
                                return <ContadorNavigator {...props} />;
                            case 'CLIENTE':       
                                return <ClienteNavigator {...props} />;
                            default:            
                                return <WelcomeScreen {...props} />;
                        }
                    }}
                </Stack.Screen>
            )}
        </Stack.Navigator>
    );
};

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <SafeAreaProvider>
                        <AuthProvider>
                            <NavigationContainer>
                                <RootNavigator />
                            </NavigationContainer>
                        </AuthProvider>
                    </SafeAreaProvider>
                </PersistGate>
            </Provider>
        </GestureHandlerRootView>
    );
}