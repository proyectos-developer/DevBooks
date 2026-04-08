import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    StatusBar, Dimensions, Modal, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../redux/axios_auth';
import { constantes } from '../../uri/constantes';

const { width } = Dimensions.get('window');

export default function ChangePasswordScreen({ navigation }) {
    const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    // Estado del Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', icon: '', color: '#10b981', action: null });

    const showModal = (title, message, type, action = null) => {
        let icon = 'checkmark-circle';
        let color = '#10b981';

        if (type === 'error') {
            icon = 'alert-circle';
            color = '#ef4444';
        } else if (type === 'warning') {
            icon = 'warning';
            color = '#f59e0b';
        }

        setModalConfig({ title, message, icon, color, action });
        setModalVisible(true);
    };

    const handleUpdate = async () => {
        if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
            return showModal("Aviso", "Por favor completa todos los campos.", "warning");
        }
        if (form.newPassword !== form.confirmPassword) {
            return showModal("Error", "Las nuevas contraseñas no coinciden.", "error");
        }
        
        setLoading(true);
        try {
            const res = await api.post(`${constantes().url_principal[0].url}/apimovil/contador/change-password`, form);
            if (res.data.success) {
                showModal("Éxito", "Contraseña actualizada correctamente.", "success", () => navigation.goBack());
            } else {
                showModal("Aviso", res.data.mensaje, "warning");
            }
        } catch (e) {
            showModal("Error", "No se pudo procesar la solicitud.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Ionicons name={modalConfig.icon} size={60} color={modalConfig.color} />
                        <Text style={styles.modalTitle}>{modalConfig.title}</Text>
                        <Text style={styles.modalMessage}>{modalConfig.message}</Text>
                        <TouchableOpacity 
                            style={[styles.modalBtn, { backgroundColor: modalConfig.color }]} 
                            onPress={() => {
                                setModalVisible(false);
                                if (modalConfig.action) modalConfig.action();
                            }}
                        >
                            <Text style={styles.modalBtnText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Seguridad</Text>
                        <Text style={styles.headerSub}>Actualizar credenciales</Text>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.infoCard}>
                        <Ionicons name="shield-checkmark" size={40} color="#10b981" />
                        <Text style={styles.instructions}>
                            Tu seguridad es nuestra prioridad. Actualiza tu clave periódicamente para proteger el acceso a tus datos contables.
                        </Text>
                    </View>
                    
                    <View style={styles.formGroup}>
                        <InputField label="Contraseña Actual" icon="lock-closed-outline" secure onChange={(val) => setForm({...form, oldPassword: val})} />
                        <InputField label="Nueva Contraseña" icon="key-outline" secure onChange={(val) => setForm({...form, newPassword: val})} />
                        <InputField label="Confirmar Nueva Contraseña" icon="checkmark-shield-outline" secure onChange={(val) => setForm({...form, confirmPassword: val})} />
                    </View>

                    {/* BOTÓN CORREGIDO */}
                    <TouchableOpacity 
                        style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
                        onPress={handleUpdate}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.saveBtnText}>
                            {loading ? 'Procesando...' : 'Actualizar Contraseña'}
                        </Text>
                        {!loading && <Ionicons name="arrow-forward" size={20} color="#ffffff" style={{marginLeft: 10}} />}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const InputField = ({ label, icon, secure, onChange }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputWrapper}>
            <Ionicons name={icon} size={20} color="#94a3b8" />
            <TextInput 
                style={styles.input} 
                secureTextEntry={secure} 
                placeholder="••••••••" 
                placeholderTextColor="#cbd5e1"
                onChangeText={onChange}
            />
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerContainer: { height: 170, position: 'absolute', top: 0, width: '100%', zIndex: 10 },
    headerBg: { position: 'absolute', width: width, height: 170, backgroundColor: '#0f172a', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerContent: { paddingHorizontal: 25, paddingTop: 60, flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
    headerSub: { color: '#10b981', fontSize: 13, fontWeight: '600' },
    scrollContent: { paddingHorizontal: 25, paddingTop: 180, paddingBottom: 120 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', alignItems: 'center' },
    modalCard: { width: width * 0.85, backgroundColor: '#fff', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 20 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginTop: 15 },
    modalMessage: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 10, lineHeight: 20, fontWeight: '500' },
    modalBtn: { marginTop: 25, paddingHorizontal: 40, paddingVertical: 15, borderRadius: 15, width: '100%', alignItems: 'center' },
    modalBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },

    infoCard: { backgroundColor: '#fff', borderRadius: 25, padding: 20, alignItems: 'center', marginBottom: 25, elevation: 4 },
    instructions: { color: '#64748b', fontSize: 13, lineHeight: 20, marginTop: 10, textAlign: 'center', fontWeight: '500' },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 15, height: 60, borderWidth: 1, borderColor: '#f1f5f9', elevation: 2 },
    input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#0f172a', fontWeight: '600' },
    
    /* ESTILOS DE BOTÓN ACTUALIZADOS */
    saveBtn: { 
        backgroundColor: '#0f172a', 
        flexDirection: 'row', 
        height: 65, 
        borderRadius: 22, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 10, 
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    saveBtnText: { 
        color: '#ffffff', // Color blanco puro
        fontSize: 16, 
        fontWeight: '800',
        textAlign: 'center'
    }
});