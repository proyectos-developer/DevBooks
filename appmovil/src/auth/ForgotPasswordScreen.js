import React, { useState } from 'react';
import { 
    StyleSheet, Text, View, TextInput, TouchableOpacity, 
    ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
    StatusBar, Dimensions, Alert
} from 'react-native';
import axios from 'axios';
import { constantes } from '../uri/constantes';

const { width } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }) {

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleReset = async () => {
        if (!email) {
            Alert.alert("Atención", "Por favor ingresa tu correo electrónico.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${constantes().url_principal[0].url}/api/auth/forgot-password`, { email });
            if (response.data.success) {
                setSent(true);
            } else {
                Alert.alert("Error", response.data.mensaje);
            }
        } catch (err) {
            Alert.alert("Error", "No se pudo conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* HEADER PRO */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBackground} />
                <View style={styles.headerContent}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.iconText}>🔑</Text>
                    </View>
                    <Text style={styles.headerTitle}>Recuperar Acceso</Text>
                    <Text style={styles.headerSubtitle}>Seguridad DevBooks</Text>
                </View>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scroll}>
                    <View style={styles.mainCard}>
                        {!sent ? (
                            <>
                                <Text style={styles.instruction}>
                                    Ingresa el correo asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
                                </Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Correo Electrónico</Text>
                                    <TextInput 
                                        style={styles.input}
                                        placeholder="ejemplo@empresa.com"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>

                                <TouchableOpacity 
                                    style={styles.actionBtn} 
                                    onPress={handleReset}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.actionBtnText}>Enviar Instrucciones</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.successContainer}>
                                <View style={styles.checkBadge}>
                                    <Text style={styles.checkText}>✓</Text>
                                </View>
                                <Text style={styles.successTitle}>¡Correo Enviado!</Text>
                                <Text style={styles.successDesc}>
                                    Si {email} está en nuestra base de datos, recibirás un correo en los próximos minutos.
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity 
                            style={styles.backBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backBtnText}>Volver al Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerContainer: { height: 220, justifyContent: 'center', alignItems: 'center' },
    headerBackground: {
        position: 'absolute',
        top: -150,
        width: width * 1.5,
        height: 350,
        borderRadius: width,
        backgroundColor: '#0f172a',
    },
    headerContent: { alignItems: 'center', marginTop: 30 },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconText: { fontSize: 24 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
    headerSubtitle: { color: '#10b981', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

    scroll: { paddingHorizontal: 25 },
    mainCard: {
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 25,
        marginTop: -30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        minHeight: 300,
    },
    instruction: { color: '#64748b', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 25 },
    inputGroup: { marginBottom: 25 },
    label: { color: '#94a3b8', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
    input: { 
        backgroundColor: '#f1f5f9', 
        padding: 16, 
        borderRadius: 15, 
        fontSize: 16, 
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    actionBtn: { 
        backgroundColor: '#0f172a', 
        padding: 18, 
        borderRadius: 15, 
        alignItems: 'center',
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
    },
    actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    backBtn: { marginTop: 25, alignItems: 'center' },
    backBtnText: { color: '#94a3b8', fontWeight: '700' },

    /* Success State */
    successContainer: { alignItems: 'center', paddingVertical: 10 },
    checkBadge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#dcfce7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkText: { color: '#10b981', fontSize: 30, fontWeight: 'bold' },
    successTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 10 },
    successDesc: { textAlign: 'center', color: '#64748b', lineHeight: 20 },
});