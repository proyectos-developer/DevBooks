import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    ScrollView, Dimensions, StatusBar, Modal, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../redux/axios_auth';
import { constantes } from '../../uri/constantes';

const { width } = Dimensions.get('window');

export default function ChangePasswordScreen({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    const [form, setForm] = useState({
        password_actual: '',
        nueva_password: '',
        confirmar_password: ''
    });

    const [secure, setSecure] = useState({
        current: true,
        new: true,
        confirm: true
    });

    const handleUpdate = async () => {
        if (form.nueva_password !== form.confirmar_password) {
            return;
        }

        setLoading(true);
        try {
            const res = await api.post(`${constantes().url_principal[0].url}/apimovil/admin/cambiar-password`, {
                passwordActual: form.password_actual,
                nuevaPassword: form.nueva_password
            });

            if (res.data.success) {
                setShowModal(true);
                setTimeout(() => {
                    setShowModal(false);
                    navigation.goBack();
                }, 1500);
            }
        } catch (e) {
            console.error("Error de red:", e);
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label, key, isSecureKey) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput 
                    style={styles.input}
                    value={form[key]}
                    onChangeText={(t) => setForm({...form, [key]: t})}
                    secureTextEntry={secure[isSecureKey]}
                    placeholder="••••••••"
                    placeholderTextColor="#cbd5e1"
                />
                <TouchableOpacity 
                    onPress={() => setSecure({...secure, [isSecureKey]: !secure[isSecureKey]})}
                >
                    <Ionicons 
                        name={secure[isSecureKey] ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#94a3b8" 
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {/* --- HEADER PRO --- */}
                <View style={styles.headerWrapper}>
                    <View style={styles.headerBg} />
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.iconCircle}>
                            <Ionicons name="shield-lock" size={40} color="#10b981" />
                        </View>
                        <Text style={styles.headerTitle}>Seguridad</Text>
                        <Text style={styles.headerSub}>Actualiza tu contraseña de acceso</Text>
                    </View>
                </View>

                {/* --- FORM CARD --- */}
                <View style={styles.formCard}>
                    {renderInput("Contraseña Actual", "password_actual", "current")}
                    <View style={styles.divider} />
                    {renderInput("Nueva Contraseña", "nueva_password", "new")}
                    {renderInput("Confirmar Nueva Contraseña", "confirmar_password", "confirm")}

                    <TouchableOpacity 
                        style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveBtnText}>Cambiar Contraseña</Text>
                        )}
                    </TouchableOpacity>
                </View>
                
                <View style={styles.tipBox}>
                    <Ionicons name="information-circle-outline" size={18} color="#94a3b8" />
                    <Text style={styles.tipText}>
                        Usa al menos 8 caracteres con una combinación de letras y números para mayor seguridad.
                    </Text>
                </View>
            </ScrollView>

            {/* --- MODAL DE ÉXITO --- */}
            <Modal transparent visible={showModal} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.checkCircle}>
                            <Ionicons name="checkmark" size={35} color="#fff" />
                        </View>
                        <Text style={styles.modalTitle}>¡Actualizada!</Text>
                        <Text style={styles.modalSub}>Tu seguridad ha sido reforzada.</Text>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scroll: { paddingBottom: 40 },
    
    /* Header Styles */
    headerWrapper: { height: 260, alignItems: 'center' },
    headerBg: { 
        position: 'absolute', top: 0, width: width, height: 220, 
        backgroundColor: '#0f172a', borderBottomLeftRadius: 45, borderBottomRightRadius: 45 
    },
    headerContent: { alignItems: 'center', paddingTop: 50, width: '100%' },
    backBtn: { position: 'absolute', left: 20, top: 55, width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    iconCircle: { width: 80, height: 80, borderRadius: 25, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
    headerSub: { color: '#10b981', fontSize: 14, fontWeight: '600', marginTop: 5 },

    /* Card */
    formCard: { 
        backgroundColor: '#fff', borderRadius: 30, padding: 25, 
        marginHorizontal: 20, marginTop: -40, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 
    },
    inputGroup: { marginBottom: 20 },
    label: { color: '#94a3b8', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
    inputWrapper: { 
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', 
        borderRadius: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e2e8f0' 
    },
    input: { flex: 1, height: 50, color: '#1e293b', fontSize: 16, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 20 },
    saveBtn: { backgroundColor: '#0f172a', padding: 18, borderRadius: 18, alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    tipBox: { flexDirection: 'row', paddingHorizontal: 30, marginTop: 25, alignItems: 'flex-start' },
    tipText: { flex: 1, marginLeft: 10, color: '#94a3b8', fontSize: 12, lineHeight: 18 },

    /* Modal */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', width: width * 0.7, padding: 30, borderRadius: 30, alignItems: 'center' },
    checkCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    modalSub: { fontSize: 14, color: '#64748b', marginTop: 5, textAlign: 'center' }
});