import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    ActivityIndicator, StatusBar, Dimensions, Switch, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import { usuariosadmindata } from '../../redux/admin/usuariosadmindata.js';
import { usuariosadminConstants } from '../../uri/admin/usuariosadmin-constants.js';
import api from '../../redux/axios_auth.js';
import { constantes } from '../../uri/constantes.js';

const { width } = Dimensions.get('window');

export default function UsuariosList() {
    const dispatch = useDispatch();
    
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const { get_listar_usuarios } = useSelector(({ usuariosadmin_data }) => usuariosadmin_data);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [dispatch])
    );

    const loadData = () => {
        dispatch(usuariosadmindata(usuariosadminConstants().get_listar_usuarios));
    };

    useEffect(() => {
        if (get_listar_usuarios?.data) {
            setUsuarios(get_listar_usuarios?.data);
            setLoading(false);
        }
    }, [get_listar_usuarios]);

    const toggleSwitch = async (id, nombre, estadoActual) => {
        const nuevoEstado = estadoActual === 1 ? 0 : 1;
        try {
            await api.post(`${constantes().url_principal[0].url}/apimovil/admin/usuario-estado`, { 
                id_usuario: id, 
                nuevo_estado: nuevoEstado 
            });
            
            setModalMessage(`${nombre} ahora está ${nuevoEstado === 1 ? 'Activo' : 'Inactivo'}`);
            setShowSuccessModal(true);
            
            loadData();
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 1500);

        } catch (e) {
            console.error("Error al cambiar estado:", e);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: item.estado === 1 ? '#f0fdf4' : '#f1f5f9' }]}>
                    <Text style={[styles.avatarText, { color: item.estado === 1 ? '#10b981' : '#94a3b8' }]}>
                        {item.nombre}{item.apellido}
                    </Text>
                </View>
                <View style={styles.details}>
                    <Text style={styles.userName}>{item.nombre} {item.apellido}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={[styles.rolBadge, { backgroundColor: item.estado === 1 ? '#f0fdf4' : '#f1f5f9' }]}>
                        <Text style={[styles.rolText, { color: item.estado === 1 ? '#10b981' : '#94a3b8' }]}>
                            {item.rol}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={styles.actionColumn}>
                <Switch
                    trackColor={{ false: "#cbd5e1", true: "#10b981" }}
                    thumbColor="#fff"
                    onValueChange={() => toggleSwitch(item.id, item.nombre, item.estado)}
                    value={item.estado === 1}
                />
                <Text style={[styles.statusText, { color: item.estado === 1 ? '#10b981' : '#94a3b8' }]}>
                    {item.estado === 1 ? 'Activo' : 'Inactivo'}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{usuarios.length}</Text>
                        </View>
                    </View>
                    <Text style={styles.headerSubtitle}>Administra accesos y roles del equipo</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#10b981" />
                    <Text style={styles.loaderText}>Cargando equipo...</Text>
                </View>
            ) : (
                <FlatList
                    data={usuarios || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text style={styles.empty}>No hay otros usuarios registrados.</Text>}
                />
            )}

            {/* --- MODAL DE CONFIRMACIÓN PRO --- */}
            <Modal transparent visible={showSuccessModal} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.checkCircle}>
                            <Ionicons name="checkmark" size={32} color="#fff" />
                        </View>
                        <Text style={styles.modalTitle}>Estado Actualizado</Text>
                        <Text style={styles.modalSub}>{modalMessage}</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 10, color: '#94a3b8', fontWeight: '600' },
    
    /* Header Pro */
    headerContainer: { height: 180, position: 'relative' },
    headerBg: { 
        position: 'absolute', top: 0, width: width, height: 180, 
        backgroundColor: '#0f172a', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 
    },
    headerContent: { paddingHorizontal: 25, paddingTop: 60 },
    headerTop: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
    countBadge: { 
        backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 10, 
        paddingVertical: 2, borderRadius: 10, marginLeft: 12 
    },
    countText: { color: '#10b981', fontWeight: '800', fontSize: 12 },
    headerSubtitle: { color: '#94a3b8', fontSize: 14, fontWeight: '500', marginTop: 8 },

    /* List & Cards */
    listContent: { padding: 20, paddingBottom: 100, marginTop: -30 },
    userCard: { 
        flexDirection: 'row', backgroundColor: '#fff', padding: 18, 
        borderRadius: 24, marginBottom: 15, alignItems: 'center', 
        shadowColor: '#0f172a', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { 
        width: 50, height: 50, borderRadius: 16, 
        justifyContent: 'center', alignItems: 'center', marginRight: 15 
    },
    avatarText: { fontWeight: '800', fontSize: 16 },
    details: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    userEmail: { fontSize: 12, color: '#94a3b8', marginTop: 2, fontWeight: '500' },
    rolBadge: { 
        alignSelf: 'flex-start', paddingHorizontal: 8, 
        paddingVertical: 3, borderRadius: 8, marginTop: 8 
    },
    rolText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
    actionColumn: { alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#f1f5f9', paddingLeft: 15 },
    statusText: { fontSize: 10, fontWeight: '800', marginTop: 6, textTransform: 'uppercase' },
    empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8', fontWeight: '600' },

    /* Modal Styles */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { 
        backgroundColor: '#fff', width: width * 0.75, padding: 25, 
        borderRadius: 30, alignItems: 'center', elevation: 20 
    },
    checkCircle: { 
        width: 60, height: 60, borderRadius: 30, backgroundColor: '#10b981', 
        justifyContent: 'center', alignItems: 'center', marginBottom: 15 
    },
    modalTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
    modalSub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 5, fontWeight: '500' }
});