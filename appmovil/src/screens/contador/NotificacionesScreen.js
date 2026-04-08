import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    StatusBar, Dimensions, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../redux/axios_auth';
import { perfilcontadordata } from '../../redux/contador/perfilcontadordata.js';
import { perfilcontadorConstants } from '../../uri/contador/perfilcontador-constants.js';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function NotificacionesScreen({ navigation }) {

    const dispatch = useDispatch()

    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    const {get_notificaciones} = useSelector(({perfilcontador_data}) => perfilcontador_data)

    useFocusEffect(
        useCallback(() => {
            fetchNotificaciones();
        }, [])
    )

    const fetchNotificaciones = () => {
        dispatch (perfilcontadordata(perfilcontadorConstants('0', {}, false).get_notificaciones))
    };

    useEffect(() => {
        if (get_notificaciones?.data){
            setNotificaciones(get_notificaciones.data)
            setLoading(false)
        }
    }, [get_notificaciones])

    const renderItem = ({ item }) => (
        <View style={[styles.card, !item.leido && styles.cardUnread]}>
            <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.tipo) }]}>
                <Ionicons name={getIconName(item.tipo)} size={22} color="#fff" />
            </View>
            <View style={styles.content}>
                <Text style={styles.notifTitle}>{item.titulo}</Text>
                <Text style={styles.notifMsg}>{item.mensaje}</Text>
                <Text style={styles.notifTime}>{item.fecha_registro}</Text>
            </View>
        </View>
    );

    const getIconName = (tipo) => {
        if (tipo === 'URGENTE') return 'alert-circle';
        if (tipo === 'BANCO') return 'card';
        return 'notifications';
    };

    const getIconColor = (tipo) => {
        if (tipo === 'URGENTE') return '#ef4444';
        if (tipo === 'BANCO') return '#10b981';
        return '#0f172a';
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO FIJO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Notificaciones</Text>
                        <Text style={styles.headerSub}>Alertas del sistema</Text>
                    </View>
                </View>
            </View>

            {loading ? <ActivityIndicator size="large" color="#10b981" style={{marginTop: 250}} /> : (
                <FlatList 
                    data={notificaciones}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.scrollList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="notifications-off-outline" size={60} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No tienes notificaciones pendientes.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerContainer: { height: 170, position: 'absolute', top: 0, width: '100%', zIndex: 10 },
    headerBg: { position: 'absolute', width: width, height: 170, backgroundColor: '#0f172a', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerContent: { paddingHorizontal: 25, paddingTop: 60, flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
    headerSub: { color: '#10b981', fontSize: 13, fontWeight: '600' },
    
    scrollList: { paddingHorizontal: 20, paddingTop: 180, paddingBottom: 130 },
    
    card: { flexDirection: 'row', backgroundColor: '#fff', padding: 18, borderRadius: 25, marginBottom: 12, alignItems: 'center', elevation: 2 },
    cardUnread: { borderLeftWidth: 4, borderLeftColor: '#10b981' },
    iconContainer: { width: 45, height: 45, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    content: { flex: 1 },
    notifTitle: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
    notifMsg: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
    notifTime: { fontSize: 11, color: '#94a3b8', marginTop: 8, fontWeight: '700' },
    
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#94a3b8', fontWeight: '600', marginTop: 15 }
});