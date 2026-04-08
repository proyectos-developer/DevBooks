import React, { useState } from 'react';
import { 
    StyleSheet, Text, View, TextInput, TouchableOpacity, 
    ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
    StatusBar, Dimensions
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { constantes } from '../uri/constantes';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Por favor, completa todos los campos.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            console.log (email, password)
            const response = await axios.post(`${constantes().url_principal[0].url}/api/auth/login`, { email, password });
            if (response.data.success) {
                await login(response.data.user, response.data.token);
            } else {
                setError(response.data.mensaje);
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* --- HEADER PRO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBackground} />
                <View style={styles.headerContent}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoIcon}>DB</Text>
                    </View>
                    <Text style={styles.mainTitle}>Dev<Text style={styles.boldTitle}>Books</Text></Text>
                    <Text style={styles.headerSubtitle}>Gestión Contable Cloud</Text>
                </View>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.flex}
            >
                <ScrollView contentContainerStyle={styles.scroll}>
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Ingreso al Sistema</Text>

                        {error ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Correo Electrónico</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="usuario@developerideas.com"
                                placeholderTextColor="#94a3b8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contraseña</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity 
                            onPress={() => navigation.navigate('ForgotPassword')}
                            style={styles.forgotBtn}
                        >
                            <Text style={styles.forgotPass}>¿Problemas para entrar?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.loginBtn} 
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginBtnText}>Acceder ahora</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.backBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backBtnText}>Regresar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    flex: { flex: 1 },
    
    /* Header Pro Styles */
    headerContainer: {
        height: 280,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBackground: {
        position: 'absolute',
        top: -100,
        width: width * 1.5,
        height: 380,
        borderRadius: width,
        backgroundColor: '#0f172a', // Azul Oscuro Profundo
    },
    headerContent: {
        alignItems: 'center',
        marginTop: 40,
    },
    logoCircle: {
        width: 70,
        height: 70,
        borderRadius: 20,
        backgroundColor: '#10b981', // Verde DevBooks
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        transform: [{ rotate: '45deg' }], // Estilo diamante pro
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    logoIcon: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        transform: [{ rotate: '-45deg' }],
    },
    mainTitle: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '300',
    },
    boldTitle: {
        fontWeight: '900',
        color: '#10b981',
    },
    headerSubtitle: {
        color: '#94a3b8',
        fontSize: 14,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginTop: 5,
    },

    /* Form Styles */
    scroll: { flexGrow: 1, paddingHorizontal: 25 },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 30,
        marginTop: -40, // Efecto de solapamiento pro
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 30,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 25,
        textAlign: 'center',
    },
    errorBox: { 
        backgroundColor: '#fee2e2', 
        padding: 12, 
        borderRadius: 12, 
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444'
    },
    errorText: { color: '#991b1b', fontSize: 13, fontWeight: '600' },
    inputGroup: { marginBottom: 20 },
    label: { color: '#64748b', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
    input: { 
        backgroundColor: '#f1f5f9', 
        padding: 16, 
        borderRadius: 15, 
        fontSize: 16, 
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    forgotBtn: { alignSelf: 'flex-end', marginBottom: 25 },
    forgotPass: { color: '#10b981', fontWeight: '700', fontSize: 14 },
    loginBtn: { 
        backgroundColor: '#0f172a', 
        padding: 18, 
        borderRadius: 15, 
        alignItems: 'center',
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    backBtn: { marginTop: 20, alignItems: 'center' },
    backBtnText: { color: '#94a3b8', fontWeight: '600', fontSize: 14 }
});