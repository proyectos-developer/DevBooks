import React, { useState } from 'react';
import { 
    StyleSheet, Text, View, TextInput, TouchableOpacity, 
    ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
    StatusBar, Alert, Dimensions
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {constantes} from '../uri/constantes'

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    
    const [form, setForm] = useState({
        ruc: '', razon_social: '', nombre_comercial: '', direccion: '',
        nombre: '', apellido: '', email: '', password: ''
    });

    const handleRegister = async () => {
        if (!form.ruc || !form.razon_social || !form.email || !form.password) {
            Alert.alert("Campos incompletos", "RUC, Razón Social, Email y Contraseña son obligatorios.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${constantes().url_principal[0].url}/api/auth/register`, form);
            if (response.data.success) {
                await login(response.data.user, response.data.token);
            } else {
                Alert.alert("Error", response.data.mensaje);
            }
        } catch (err) {
          console.log (err)
            Alert.alert("Error", "No se pudo conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    const updateForm = (key, value) => setForm({ ...form, [key]: value });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* --- HEADER PRO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBackground} />
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Nueva Cuenta</Text>
                    <Text style={styles.headerSubtitle}>Únete a la red de DevBooks</Text>
                </View>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    contentContainerStyle={styles.scroll} 
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.mainCard}>
                        {/* SECCIÓN 1: EMPRESA */}
                        <View style={styles.sectionHeader}>
                            <View style={styles.iconBadge}>
                                <Text style={styles.iconText}>🏢</Text>
                            </View>
                            <Text style={styles.sectionTitle}>Datos de la Empresa</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>RUC (11 dígitos)</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="20XXXXXXXXX"
                                placeholderTextColor="#94a3b8"
                                keyboardType="numeric"
                                maxLength={11}
                                onChangeText={(v) => updateForm('ruc', v)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Razón Social</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="Nombre legal de la empresa"
                                placeholderTextColor="#94a3b8"
                                onChangeText={(v) => updateForm('razon_social', v)}
                            />
                        </View>

                        <View style={styles.divider} />

                        {/* SECCIÓN 2: ADMINISTRADOR */}
                        <View style={styles.sectionHeader}>
                            <View style={[styles.iconBadge, { backgroundColor: '#e0f2fe' }]}>
                                <Text style={styles.iconText}>👤</Text>
                            </View>
                            <Text style={styles.sectionTitle}>Datos del Administrador</Text>
                        </View>
                        
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Nombre</Text>
                                <TextInput 
                                    style={styles.input}
                                    placeholder="Nombres"
                                    placeholderTextColor="#94a3b8"
                                    onChangeText={(v) => updateForm('nombre', v)}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Apellido</Text>
                                <TextInput 
                                    style={styles.input}
                                    placeholder="Apellidos"
                                    placeholderTextColor="#94a3b8"
                                    onChangeText={(v) => updateForm('apellido', v)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Correo Electrónico</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="admin@empresa.com"
                                placeholderTextColor="#94a3b8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onChangeText={(v) => updateForm('email', v)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contraseña</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="Mínimo 8 caracteres"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry
                                onChangeText={(v) => updateForm('password', v)}
                            />
                        </View>

                        <TouchableOpacity 
                            style={styles.registerBtn} 
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.registerBtnText}>Crear mi Organización</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.footerLink}>
                            <Text style={styles.footerText}>¿Ya tienes cuenta? <Text style={styles.footerBold}>Inicia Sesión</Text></Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    
    /* Header Pro */
    headerContainer: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBackground: {
        position: 'absolute',
        top: -200,
        width: width * 1.6,
        height: 350,
        borderRadius: width,
        backgroundColor: '#0f172a',
    },
    headerContent: {
        alignItems: 'center',
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    headerSubtitle: {
        color: '#10b981',
        fontSize: 14,
        marginTop: 4,
        fontWeight: '600',
    },

    /* Scroll & Card */
    scroll: { paddingHorizontal: 20, paddingBottom: 40 },
    mainCard: {
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 20,
        marginTop: -30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },

    /* Sections */
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    iconBadge: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: { fontSize: 18 },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1e293b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 25,
    },

    /* Inputs */
    inputGroup: { marginBottom: 18 },
    label: { 
        color: '#64748b', 
        fontSize: 11, 
        fontWeight: '700', 
        textTransform: 'uppercase', 
        marginBottom: 6, 
        marginLeft: 4 
    },
    input: { 
        backgroundColor: '#f8fafc', 
        padding: 14, 
        borderRadius: 12, 
        fontSize: 15, 
        color: '#1e293b', 
        borderWidth: 1, 
        borderColor: '#e2e8f0' 
    },
    row: { flexDirection: 'row' },

    /* Buttons */
    registerBtn: { 
        backgroundColor: '#0f172a', 
        padding: 18, 
        borderRadius: 15, 
        alignItems: 'center', 
        marginTop: 20,
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    footerLink: { marginTop: 25, alignItems: 'center' },
    footerText: { color: '#64748b', fontSize: 14 },
    footerBold: { color: '#10b981', fontWeight: '700' }
});