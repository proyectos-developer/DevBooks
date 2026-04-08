import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    StatusBar, Dimensions, ScrollView, KeyboardAvoidingView, 
    Platform, Modal, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../redux/axios_auth';
import { constantes } from '../../uri/constantes';

const { width } = Dimensions.get('window');

export default function SoporteScreen({ navigation }) {
    const [form, setForm] = useState({ asunto: '', mensaje: '', prioridad: 'MEDIA' });
    const [loading, setLoading] = useState(false);
    
    // Estado para el Modal de éxito/error
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' });

    const handleSend = async () => {
        if (!form.asunto || !form.mensaje) {
            setModalConfig({ title: 'Aviso', message: 'Por favor, completa todos los campos', type: 'warning' });
            setModalVisible(true);
            return;
        }
        
        setLoading(true);
        try {
            const res = await api.post(`${constantes().url_principal[0].url}/apimovil/contador/soporte/ticket`, form);
            
            if (res.data.success) {
                setModalConfig({ title: '¡Enviado!', message: 'Tu ticket ha sido registrado con éxito', type: 'success' });
                setModalVisible(true);

                // Auto-cierre del modal y navegación después de 1.5 segundos
                setTimeout(() => {
                    setModalVisible(false);
                    navigation.goBack();
                }, 1500);
            }
        } catch (e) {
            setModalConfig({ title: 'Error', message: 'No se pudo procesar tu solicitud', type: 'error' });
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- MODAL DE ESTADO AUTOMÁTICO --- */}
            <Modal transparent visible={modalVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Ionicons 
                            name={modalConfig.type === 'success' ? "checkmark-circle" : "alert-circle"} 
                            size={60} 
                            color={modalConfig.type === 'success' ? "#10b981" : "#ef4444"} 
                        />
                        <Text style={styles.modalTitle}>{modalConfig.title}</Text>
                        <Text style={styles.modalMessage}>{modalConfig.message}</Text>
                    </View>
                </View>
            </Modal>

            {/* --- HEADER PRO FIJO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Soporte Técnico</Text>
                        <Text style={styles.headerSub}>Asistencia Developer Ideas</Text>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={{flex: 1}}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.infoBox}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="headset-outline" size={32} color="#10b981" />
                        </View>
                        <Text style={styles.infoText}>
                            ¿Tienes algún problema con DevBooks? Describe tu incidencia y nuestro equipo técnico te responderá a la brevedad.
                        </Text>
                    </View>

                    <Text style={styles.label}>Asunto del problema</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Ej: Error al cargar el SIRE"
                        placeholderTextColor="#94a3b8"
                        onChangeText={(val) => setForm({...form, asunto: val})}
                    />

                    <Text style={styles.label}>Descripción detallada</Text>
                    <TextInput 
                        style={[styles.input, styles.textArea]} 
                        multiline 
                        numberOfLines={6}
                        placeholder="Describe detalladamente lo que sucede..."
                        placeholderTextColor="#94a3b8"
                        onChangeText={(val) => setForm({...form, mensaje: val})}
                    />

                    <TouchableOpacity 
                        style={[styles.sendBtn, loading && { opacity: 0.7 }]} 
                        onPress={handleSend}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.sendBtnText}>Enviar Ticket</Text>
                                <Ionicons name="paper-plane" size={18} color="#fff" style={{marginLeft: 10}} />
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    
    /* Header Pro */
    headerContainer: { height: 170, position: 'absolute', top: 0, width: '100%', zIndex: 10 },
    headerBg: { 
        position: 'absolute', width: width, height: 170, 
        backgroundColor: '#0f172a', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 
    },
    headerContent: { paddingHorizontal: 25, paddingTop: 60, flexDirection: 'row', alignItems: 'center' },
    backBtn: { 
        width: 45, height: 45, borderRadius: 15, 
        backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 
    },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
    headerSub: { color: '#10b981', fontSize: 13, fontWeight: '600' },

    /* Scroll y Formulario */
    scrollContent: { 
        paddingHorizontal: 25, 
        paddingTop: 185, // Evita solapamiento con el Header curvo
        paddingBottom: 150 // Espacio generoso para el Bottom Tab flotante
    },
    
    /* Modal Pro */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center' },
    modalCard: { width: width * 0.8, backgroundColor: '#fff', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 20 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginTop: 15 },
    modalMessage: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 20 },

    /* Componentes Visuales */
    infoBox: { backgroundColor: '#fff', padding: 25, borderRadius: 30, alignItems: 'center', marginBottom: 30, elevation: 2 },
    iconCircle: { width: 60, height: 60, borderRadius: 20, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    infoText: { textAlign: 'center', color: '#64748b', fontSize: 14, lineHeight: 22, fontWeight: '500' },
    
    label: { fontSize: 11, fontWeight: '800', color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 5 },
    input: { 
        backgroundColor: '#fff', borderRadius: 20, padding: 18, fontSize: 16, 
        color: '#0f172a', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 25,
        elevation: 1, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5
    },
    textArea: { height: 140, textAlignVertical: 'top' },
    
    sendBtn: { 
        backgroundColor: '#0f172a', height: 65, borderRadius: 22, 
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
        marginTop: 10, elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10
    },
    sendBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' }
});