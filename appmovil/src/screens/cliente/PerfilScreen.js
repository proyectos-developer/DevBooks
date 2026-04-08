import React, { useCallback, useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    StatusBar, Dimensions, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../redux/axios_auth';
import { perfilclientedata } from '../../redux/cliente/perfilclientedata.js';
import { perfilclienteConstants } from '../../uri/cliente/perfilcliente-constants.js';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function PerfilScreen({ navigation }) {

    const { logout } = useAuth();

    const dispatch = useDispatch()
  
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const {get_mi_perfil} = useSelector(({perfilcliente_data}) => perfilcliente_data)

    useFocusEffect(
      useCallback(() => {
          fetchPerfil();
      }, [])
    )

    const fetchPerfil = () => {
      dispatch (perfilclientedata(perfilclienteConstants('0', {}, false).get_mi_perfil))
    };

    useEffect(() => {
      if (get_mi_perfil?.data){
        setUser(get_mi_perfil.data)
        setLoading(false)
      }
    }, [get_mi_perfil])

    if (loading) return <ActivityIndicator size="large" color="#10b981" style={{ flex: 1 }} />;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO FIJO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Mi Cuenta</Text>
                    <Text style={styles.headerSub}>Configuración personal</Text>
                </View>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* TARJETA DE IDENTIDAD */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user?.nombre}{user?.apellido}
                        </Text>
                    </View>
                    <Text style={styles.userName}>{user?.nombre} {user?.apellido}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{user?.rol}</Text>
                    </View>
                    <Text style={styles.empresaName}>{user?.empresa}</Text>
                </View>

                {/* MENÚ DE OPCIONES */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Seguridad</Text>
                    <MenuOption 
                        icon="lock-closed-outline" 
                        title="Cambiar Contraseña" 
                        onPress={() => navigation.navigate('ChangePassword')} 
                    />
                </View>

                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Ayuda y Soporte</Text>
                    <MenuOption 
                        icon="chatbubble-ellipses-outline" 
                        title="Soporte Técnico" 
                        onPress={() => navigation.navigate('Soporte')} 
                    />
                    <MenuOption 
                        icon="information-circle-outline" 
                        title="Acerca de DevBooks" 
                        onPress={() => navigation.navigate('About')} 
                    />
                </View>

                {/* BOTÓN CERRAR SESIÓN */}
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Cerrar Sesión Segura</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Versión 1.0.4 PRO</Text>
            </ScrollView>
        </View>
    );
}

const MenuOption = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIconBg}>
            <Ionicons name={icon} size={20} color="#0f172a" />
        </View>
        <Text style={styles.menuTitle}>{title}</Text>
        <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerContainer: { height: 170, position: 'absolute', top: 0, width: '100%', zIndex: 10 },
    headerBg: { position: 'absolute', width: width, height: 170, backgroundColor: '#0f172a', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerContent: { paddingHorizontal: 25, paddingTop: 60 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
    headerSub: { color: '#10b981', fontSize: 13, fontWeight: '600' },
    
    // PADDINGS CLAVE: 180 arriba para el Header, 140 abajo para el Bottom Tab
    scrollContent: { paddingHorizontal: 25, paddingTop: 140, paddingBottom: 140 },
    
    profileCard: { backgroundColor: '#fff', borderRadius: 30, padding: 25, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    avatarContainer: { width: 80, height: 80, borderRadius: 28, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    avatarText: { fontSize: 24, fontWeight: '900', color: '#10b981' },
    userName: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
    roleBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 5 },
    roleText: { fontSize: 10, fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },
    empresaName: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginTop: 10 },

    menuSection: { marginTop: 25 },
    sectionTitle: { fontSize: 13, fontWeight: '800', color: '#94a3b8', marginBottom: 12, marginLeft: 5, textTransform: 'uppercase' },
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 22, marginBottom: 10, elevation: 2 },
    menuIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1e293b' },

    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, padding: 18, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: '#fee2e2' },
    logoutText: { color: '#ef4444', fontWeight: '800', marginLeft: 10 },
    versionText: { textAlign: 'center', marginTop: 20, color: '#cbd5e1', fontSize: 11, fontWeight: '700' }
});