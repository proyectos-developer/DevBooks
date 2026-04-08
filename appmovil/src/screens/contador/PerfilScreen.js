import React, { useCallback, useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    StatusBar, Dimensions, ActivityIndicator, Platform 
} from 'react-native'; 
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { perfilcontadordata } from '../../redux/contador/perfilcontadordata.js';
import { perfilcontadorConstants } from '../../uri/contador/perfilcontador-constants.js';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function PerfilScreen({ navigation }) {
    const dispatch = useDispatch();
    const { logout } = useAuth();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const { get_mi_perfil } = useSelector(({ perfilcontador_data }) => perfilcontador_data);

    useFocusEffect(
        useCallback(() => {
            fetchPerfil();
        }, [dispatch])
    );

    const fetchPerfil = () => {
        dispatch(perfilcontadordata(perfilcontadorConstants('0', {}, false).get_mi_perfil));
    };

    useEffect(() => {
        if (get_mi_perfil?.data) {
            setUser(get_mi_perfil.data);
            setLoading(false);
        }
    }, [get_mi_perfil]);

    if (loading) return (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loaderText}>Cargando perfil...</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO FIJO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Mi Perfil</Text>
                    <Text style={styles.headerSub}>Configuración y Cuenta</Text>
                </View>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {/* CARD DE USUARIO (Solapada con el header) */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarInner}>
                            <Text style={styles.avatarText}>
                                {user?.nombre ? user.nombre[0] : ''}{user?.apellido ? user.apellido[0] : ''}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.userName}>{user?.nombre} {user?.apellido}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.userRole}>{user?.rol || 'Contador'}</Text>
                    </View>
                    
                    <View style={styles.empresaBadge}>
                        <Ionicons name="business" size={16} color="#10b981" />
                        <Text style={styles.empresaText} numberOfLines={1}> {user?.empresa || 'Empresa No Asignada'}</Text>
                    </View>
                </View>

                {/* SECCIÓN SEGURIDAD */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Seguridad</Text>
                    <View style={styles.menuContainer}>
                        <MenuOption 
                            icon="lock-closed-outline" 
                            title="Cambiar Contraseña" 
                            onPress={() => navigation.navigate('ChangePassword')} 
                        />
                        <View style={styles.divider} />
                        <MenuOption 
                            icon="shield-checkmark-outline" 
                            title="Autenticación de dos pasos" 
                            onPress={() => {}} 
                        />
                    </View>
                </View>

                {/* SECCIÓN APLICACIÓN */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferencias</Text>
                    <View style={styles.menuContainer}>
                        <MenuOption icon="notifications-outline" title="Notificaciones" onPress={() => navigation.navigate ('Notificaciones')} />
                        <View style={styles.divider} />
                        <MenuOption icon="help-circle-outline" title="Soporte Técnico" onPress={() => navigation.navigate ('Soporte')} />
                        <View style={styles.divider} />
                        <MenuOption icon="information-circle-outline" title="Acerca de DevBooks" onPress={() => navigation.navigate('About')} />
                    </View>
                </View>

                {/* BOTÓN CERRAR SESIÓN (Espacio extra abajo) */}
                <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>
                
                <Text style={styles.versionText}>Versión 1.0.4 PRO</Text>
            </ScrollView>
        </View>
    );
}

const MenuOption = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
        <View style={styles.menuIconBg}>
            <Ionicons name={icon} size={20} color="#0f172a" />
        </View>
        <Text style={styles.menuTitle}>{title}</Text>
        <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 10, color: '#64748b', fontWeight: '600' },
    
    /* Header Pro Fijo */
    headerContainer: { 
        height: 180, 
        position: 'absolute', 
        top: 0, 
        width: '100%', 
        zIndex: 10 
    },
    headerBg: { 
        position: 'absolute', 
        width: width, 
        height: 180, 
        backgroundColor: '#0f172a', 
        borderBottomLeftRadius: 40, 
        borderBottomRightRadius: 40 
    },
    headerContent: { paddingHorizontal: 25, paddingTop: 60 },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
    headerSub: { color: '#10b981', fontSize: 13, fontWeight: '600', marginTop: 2 },
    
    /* Scroll estratégico */
    scrollContent: { 
        paddingHorizontal: 20, 
        paddingTop: 130, // Permite que el card suba un poco sobre el header
        paddingBottom: 140 // Espacio generoso para no ser tapado por el Tab Bar flotante
    },
    
    /* Profile Card */
    profileCard: { 
        backgroundColor: '#fff', 
        borderRadius: 30, 
        padding: 25, 
        alignItems: 'center', 
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 15
    },
    avatarContainer: { 
        padding: 4, 
        backgroundColor: '#fff', 
        borderRadius: 32, 
        marginTop: -10,
        marginBottom: 15 
    },
    avatarInner: {
        width: 85, 
        height: 85, 
        borderRadius: 28, 
        backgroundColor: '#f0fdf4', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    avatarText: { fontSize: 28, fontWeight: '900', color: '#10b981' },
    userName: { fontSize: 20, fontWeight: '800', color: '#1e293b', textAlign: 'center' },
    roleBadge: { 
        backgroundColor: '#f1f5f9', 
        paddingHorizontal: 12, 
        paddingVertical: 4, 
        borderRadius: 8, 
        marginTop: 6 
    },
    userRole: { fontSize: 11, color: '#64748b', fontWeight: '800', textTransform: 'uppercase' },
    empresaBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginTop: 15, 
        backgroundColor: 'rgba(16, 185, 129, 0.05)', 
        paddingHorizontal: 15, 
        paddingVertical: 8, 
        borderRadius: 15,
        maxWidth: '90%'
    },
    empresaText: { color: '#10b981', fontSize: 13, fontWeight: '700' },

    /* Secciones */
    section: { marginTop: 25 },
    sectionTitle: { fontSize: 13, fontWeight: '800', color: '#94a3b8', marginBottom: 12, paddingLeft: 10, textTransform: 'uppercase', letterSpacing: 1 },
    menuContainer: { backgroundColor: '#fff', borderRadius: 25, overflow: 'hidden', elevation: 2 },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    menuIconBg: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1e293b' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 70 },

    /* Botón Salida */
    logoutBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginTop: 35, 
        padding: 18, 
        borderRadius: 22, 
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#fee2e2'
    },
    logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 16, marginLeft: 10 },
    versionText: { textAlign: 'center', marginTop: 20, color: '#cbd5e1', fontSize: 12, fontWeight: '600' }
});