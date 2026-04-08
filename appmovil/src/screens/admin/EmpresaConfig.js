import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    ScrollView, ActivityIndicator, Dimensions, Modal, StatusBar,
    KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../redux/axios_auth.js';
import { configuracionadmindata } from '../../redux/admin/configuracionadmindata.js'
import { configuracionadminConstants } from '../../uri/admin/configuracionadmin-constants.js'
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { constantes } from '../../uri/constantes.js';

const { width } = Dimensions.get('window');

export default function EmpresaConfig() {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [form, setForm] = useState({
        ruc: '', razon_social: '', nombre_comercial: '', direccion: ''
    });

    const { get_configuracion } = useSelector(({ configuracionadmin_data }) => configuracionadmin_data);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [dispatch])
    );

    const loadData = () => {
        dispatch(configuracionadmindata(configuracionadminConstants('0', {}, false).get_configuracion));
    };

    useEffect(() => {
        if (get_configuracion?.data) {
            setForm(get_configuracion.data);
            setLoading(false);
        }
    }, [get_configuracion]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.post(`${constantes().url_principal[0].url}/apimovil/admin/config`, form);
            if (res.data.success) {
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                }, 2000);
            }
        } catch (e) {
            console.error("Error al actualizar:", e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#10b981" />
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* Header queda fuera del KeyboardAvoidingView para mantenerse fijo */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <Text style={styles.title}>Configuración</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>ADMINISTRACIÓN</Text>
                    </View>
                    <Text style={styles.subtitle}>Gestiona la identidad legal de tu empresa</Text>
                </View>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView 
                    // Ajuste de paddingBottom para saltar el Bottom Tab
                    contentContainerStyle={styles.scroll} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Información Tributaria</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>RUC (Identificador Único)</Text>
                            <View style={styles.readOnlyInput}>
                                <Text style={styles.readOnlyText}>{form.ruc}</Text>
                                <Ionicons name="lock-closed" size={16} color="#94a3b8" />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Razón Social</Text>
                            <TextInput 
                                style={styles.input} 
                                value={form.razon_social}
                                onChangeText={(t) => setForm({...form, razon_social: t})}
                                placeholder="Nombre legal"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre Comercial</Text>
                            <TextInput 
                                style={styles.input} 
                                value={form.nombre_comercial}
                                onChangeText={(t) => setForm({...form, nombre_comercial: t})}
                                placeholder="Marca o nombre de fantasía"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Dirección Fiscal Completa</Text>
                            <TextInput 
                                style={[styles.input, styles.textArea]} 
                                multiline
                                numberOfLines={3}
                                value={form.direccion}
                                onChangeText={(t) => setForm({...form, direccion: t})}
                                placeholder="Av. Ejemplo 123..."
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{marginRight: 8}} />
                                    <Text style={styles.saveBtnText}>Actualizar Datos</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.certCard}>
                        <View style={styles.certHeader}>
                            <View style={styles.certIcon}>
                                <Ionicons name="key-outline" size={20} color="#10b981" />
                            </View>
                            <Text style={styles.certTitle}>Certificado Digital</Text>
                        </View>
                        <Text style={styles.certDesc}>Utilizado para la firma de comprobantes electrónicos y validación SIRE SUNAT.</Text>
                        <TouchableOpacity style={styles.uploadBtn}>
                            <Text style={styles.uploadBtnText}>Gestionar Archivo .pfx</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal transparent={true} visible={showSuccessModal} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.successIconBg}>
                            <Ionicons name="checkmark-sharp" size={40} color="#fff" />
                        </View>
                        <Text style={styles.modalTextTitle}>¡Cambios Guardados!</Text>
                        <Text style={styles.modalTextSub}>La información ha sido actualizada exitosamente.</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    headerContainer: { height: 200, position: 'relative', zIndex: 10 },
    headerBg: {
        position: 'absolute',
        top: 0,
        width: width,
        height: 200,
        backgroundColor: '#0f172a',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerContent: { paddingHorizontal: 25, paddingTop: 60 },
    title: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
    badge: { 
        backgroundColor: 'rgba(16, 185, 129, 0.2)', 
        alignSelf: 'flex-start', 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 8,
        marginTop: 5
    },
    badgeText: { color: '#10b981', fontSize: 10, fontWeight: 'bold' },
    subtitle: { color: '#94a3b8', fontSize: 14, marginTop: 12, fontWeight: '500' },

    /* Scroll mejorado con padding inferior para saltar el Bottom Tab Bar */
    scroll: { 
        paddingHorizontal: 20, 
        paddingTop: 0,
        paddingBottom: 150 // Espacio extra para que el Tab Bar no tape el botón final
    },
    card: { 
        backgroundColor: '#fff', 
        borderRadius: 28, 
        padding: 25, 
        marginTop: -30, 
        shadowColor: '#000', 
        shadowOpacity: 0.08, 
        shadowRadius: 15, 
        elevation: 5 
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 20 },
    inputGroup: { marginBottom: 18 },
    label: { color: '#64748b', fontSize: 12, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
    input: { 
        backgroundColor: '#f8fafc', 
        padding: 15, 
        borderRadius: 16, 
        borderWidth: 1, 
        borderColor: '#e2e8f0', 
        color: '#1e293b',
        fontSize: 15
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    readOnlyInput: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: '#f1f5f9', 
        padding: 15, 
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    readOnlyText: { color: '#64748b', fontWeight: 'bold', fontSize: 15 },
    
    saveBtn: { 
        backgroundColor: '#0f172a', 
        paddingVertical: 18, 
        borderRadius: 18, 
        alignItems: 'center', 
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    certCard: { 
        marginTop: 20, 
        backgroundColor: '#fff', 
        borderRadius: 24, 
        padding: 22,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    certHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    certIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center' },
    certTitle: { marginLeft: 12, fontSize: 15, fontWeight: '800', color: '#1e293b' },
    certDesc: { color: '#94a3b8', fontSize: 13, lineHeight: 20, marginBottom: 18 },
    uploadBtn: { borderWidth: 2, borderColor: '#f1f5f9', padding: 14, borderRadius: 16, alignItems: 'center' },
    uploadBtnText: { color: '#64748b', fontWeight: '700' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { 
        backgroundColor: '#fff', 
        width: width * 0.8, 
        borderRadius: 30, 
        padding: 30, 
        alignItems: 'center',
        elevation: 10
    },
    successIconBg: { 
        width: 80, 
        height: 80, 
        borderRadius: 40, 
        backgroundColor: '#10b981', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: 20
    },
    modalTextTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
    modalTextSub: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 }
});