import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    ScrollView, Dimensions, StatusBar, Modal, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../redux/axios_auth';
import { constantes } from '../../uri/constantes';

const { width, height } = Dimensions.get('window');

export default function PerfilScreen({navigation}) {
    const { user, logout, updateUserInfo } = useAuth();
  
    const [form, setForm] = useState({
        nombre: user?.nombre || '',
        apellido: user?.apellido || '',
        email: user?.email || ''
    });
    const [showModal, setShowModal] = useState(false);

    const handleUpdate = async () => {
        try {
            const res = await api.post(`${constantes().url_principal[0].url}/apimovil/admin/perfil`, form);
            if (res.data.success) {
                updateUserInfo(form); 
                setShowModal(true);
                setTimeout(() => setShowModal(false), 1500);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* Ajustamos el comportamiento del teclado para que no tape los inputs */}
            <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    // IMPORTANTE: paddingBottom alto para que el Bottom Tab no tape el final
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* --- HEADER PRO --- */}
                    <View style={styles.headerWrapper}>
                        <View style={styles.headerBg} />
                        <View style={styles.headerContent}>
                            <View style={styles.avatarLarge}>
                                <Text style={styles.avatarText}>
                                    {user?.nombre ? user.nombre[0] : ''}{user?.apellido ? user.apellido[0] : ''}
                                </Text>
                                <TouchableOpacity style={styles.editBadge}>
                                    <Ionicons name="camera" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.userName}>{user?.nombre} {user?.apellido}</Text>
                            <View style={styles.roleTag}>
                                <Text style={styles.userRole}>{user?.rol}</Text>
                            </View>
                        </View>
                    </View>

                    {/* --- FORMULARIO --- */}
                    <View style={styles.formCard}>
                        <Text style={styles.sectionTitle}>Datos Personales</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre</Text>
                            <TextInput 
                                style={styles.input} 
                                value={form.nombre}
                                onChangeText={(t) => setForm({...form, nombre: t})}
                                placeholder="Tu nombre"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Apellido</Text>
                            <TextInput 
                                style={styles.input} 
                                value={form.apellido}
                                onChangeText={(t) => setForm({...form, apellido: t})}
                                placeholder="Tu apellido"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Correo Electrónico</Text>
                            <TextInput 
                                style={styles.input} 
                                value={form.email}
                                onChangeText={(t) => setForm({...form, email: t})}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                            <Ionicons name="save-outline" size={18} color="#fff" style={{marginRight: 8}} />
                            <Text style={styles.saveBtnText}>Guardar Cambios</Text>
                        </TouchableOpacity>
                    </View>

                    {/* --- ACCIONES --- */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity 
                            style={styles.securityOption}
                            onPress={() => navigation.navigate('ChangePassword')}
                        >
                            <View style={styles.iconCircle}>
                                <Ionicons name="lock-closed-outline" size={20} color="#0f172a" />
                            </View>
                            <Text style={styles.securityText}>Cambiar Contraseña</Text>
                            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                            <Text style={styles.logoutText}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal de Éxito */}
            <Modal transparent visible={showModal} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.checkCircle}>
                            <Ionicons name="checkmark" size={30} color="#fff" />
                        </View>
                        <Text style={styles.modalTitle}>¡Actualizado!</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    
    // AJUSTE: El paddingBottom debe ser de al menos 120-150 para saltar el Bottom Tab Bar
    scrollContent: { 
        paddingBottom: 150 
    },
    
    /* Header Pro */
    headerWrapper: { height: 280, alignItems: 'center' },
    headerBg: { 
        position: 'absolute', 
        top: 0, 
        width: width, 
        height: 200, 
        backgroundColor: '#0f172a', 
        borderBottomLeftRadius: 45, 
        borderBottomRightRadius: 45 
    },
    headerContent: { alignItems: 'center', paddingTop: 60 },
    avatarLarge: { 
        width: 100, height: 100, borderRadius: 30, backgroundColor: '#10b981', 
        justifyContent: 'center', alignItems: 'center', elevation: 15, shadowColor: '#10b981', shadowOpacity: 0.4, shadowRadius: 10 
    },
    avatarText: { color: '#fff', fontSize: 36, fontWeight: '900' },
    editBadge: { 
        position: 'absolute', bottom: -5, right: -5, backgroundColor: '#1e293b', 
        padding: 8, borderRadius: 12, borderWidth: 3, borderColor: '#fff' 
    },
    userName: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 15 },
    roleTag: { backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginTop: 8 },
    userRole: { color: '#10b981', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },

    /* Formulario */
    formCard: { 
        backgroundColor: '#fff', 
        borderRadius: 30, 
        padding: 25, 
        marginHorizontal: 20, 
        marginTop: -40, 
        elevation: 5, 
        shadowColor: '#000', 
        shadowOpacity: 0.1, 
        shadowRadius: 10 
    },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginBottom: 20 },
    inputGroup: { marginBottom: 20 },
    label: { color: '#94a3b8', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
    input: { backgroundColor: '#f1f5f9', padding: 18, borderRadius: 15, fontSize: 16, color: '#1e293b' },
    saveBtn: { 
        backgroundColor: '#0f172a', 
        padding: 18, 
        borderRadius: 15, 
        alignItems: 'center', 
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    /* Acciones */
    actionsContainer: { paddingHorizontal: 20, marginTop: 20 },
    securityOption: { 
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
        padding: 15, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 
    },
    iconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    securityText: { flex: 1, marginLeft: 15, fontWeight: '700', color: '#1e293b', fontSize: 15 },
    logoutBtn: { 
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
        marginTop: 30, paddingBottom: 20 
    },
    logoutText: { color: '#ef4444', fontWeight: '800', marginLeft: 10, fontSize: 16 },

    /* Modal */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', padding: 40, borderRadius: 30, alignItems: 'center', elevation: 10 },
    checkCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' }
});