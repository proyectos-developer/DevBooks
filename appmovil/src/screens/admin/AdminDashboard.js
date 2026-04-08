import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, RefreshControl, 
    ActivityIndicator, StatusBar, Dimensions, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

// Redux
import { resumenesadmindata } from '../../redux/admin/resumenesadmindata.js';
import { resumenesadminConstants } from '../../uri/admin/resumenesadmin-constants.js';
import { useAuth } from '../../context/AuthContext.js';

const { width } = Dimensions.get('window');

export default function AdminDashboard({navigation}) {
    const dispatch = useDispatch();
    const { user } = useAuth(); 
    
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const { get_resumenes } = useSelector(({ resumenesadmin_data }) => resumenesadmin_data);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [dispatch])
    );

    const loadData = () => {
        dispatch(resumenesadmindata(resumenesadminConstants('0', {}, false).get_resumenes));
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    useEffect(() => {
        if (get_resumenes?.stats) {
            setData(get_resumenes.stats);
            setLoading(false);
            setRefreshing(false);
        }
    }, [get_resumenes]);

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loaderText}>Cargando resumen contable...</Text>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* Capa de Fondo (Header Background) fija atrás */}
            <View style={styles.headerBg} />

            <ScrollView 
                style={styles.flex}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >
                {/* --- CONTENIDO DEL HEADER (Dentro del Scroll) --- */}
                <View style={styles.headerContentInside}>
                    <View style={styles.userInfo}>
                        <View>
                            <Text style={styles.welcomeText}>Hola, {user?.nombre || 'Admin'}</Text>
                            <Text style={styles.brandText}>Dev<Text style={styles.boldText}>Books</Text> Cloud</Text>
                        </View>
                        <View style={styles.profileBadge}>
                            <Ionicons name="notifications-outline" size={24} color="#fff" />
                            <View style={styles.dot} />
                        </View>
                    </View>
                    
                    <View style={styles.dateContainer}>
                        <Ionicons name="calendar-outline" size={14} color="#10b981" />
                        <Text style={styles.dateText}>
                            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </Text>
                    </View>
                </View>

                {/* --- FILA DE KPIs (Ya no tiene margen negativo agresivo) --- */}
                <View style={styles.kpiGrid}>
                    <View style={[styles.kpiCard, styles.darkCard]}>
                        <View style={styles.kpiHeader}>
                            <View style={styles.kpiIconContainer}>
                                <Ionicons name="wallet" size={20} color="#10b981" />
                            </View>
                            <Text style={styles.kpiLabelDark}>Bancos</Text>
                        </View>
                        <Text style={styles.kpiValueWhite}>S/ {data?.saldoBancario?.toLocaleString() || '0.00'}</Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <View style={styles.kpiHeader}>
                            <View style={[styles.kpiIconContainer, {backgroundColor: '#fee2e2'}]}>
                                <Ionicons name="document-attach" size={20} color="#ef4444" />
                            </View>
                            <Text style={styles.kpiLabelLight}>SIRE</Text>
                        </View>
                        <Text style={styles.kpiValueDark}>{data?.sirePendientes || 0} <Text style={styles.unitText}>Docs</Text></Text>
                    </View>
                </View>

                {/* --- SECCIÓN DE ACTIVIDAD --- */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Últimos Movimientos</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('LibroDiario')}>
                            <Text style={styles.seeAll}>Ver todos</Text>
                        </TouchableOpacity>
                    </View>

                    {data?.recientes?.map((asiento, index) => (
                        <TouchableOpacity key={index} style={styles.asientoItem}
                            onPress={() => navigation.navigate('DetalleAsiento', { asientoId: asiento.id })}>
                            <View style={styles.asientoIconBg}>
                                <Ionicons name="receipt-outline" size={20} color="#10b981" />
                            </View>
                            <View style={styles.asientoInfo}>
                                <Text style={styles.glosaText} numberOfLines={1}>{asiento.glosa}</Text>
                                <Text style={styles.fechaText}>{new Date(asiento.fecha_asiento).toLocaleDateString()}</Text>
                            </View>
                            <Text style={styles.montoText}>S/ {asiento.total.toFixed(2)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#f8fafc' },
    flex: { flex: 1 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    loaderText: { marginTop: 10, color: '#64748b', fontWeight: '600' },
    
    /* Header Pro Background */
    headerBg: {
        position: 'absolute',
        top: 0,
        width: width,
        height: 250, // Altura suficiente para cubrir el área de texto y parte de KPIs
        backgroundColor: '#0f172a',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    /* Contenido del Header ahora fluye con el Scroll */
    headerContentInside: { 
        paddingHorizontal: 25, 
        paddingTop: 60, // Para librar el StatusBar
        paddingBottom: 25 
    },
    userInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    welcomeText: { color: '#94a3b8', fontSize: 16, fontWeight: '600' },
    brandText: { color: '#fff', fontSize: 24, fontWeight: '300' },
    boldText: { fontWeight: '900', color: '#10b981' },
    profileBadge: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    dot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#0f172a' },
    dateContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    dateText: { color: '#10b981', fontSize: 12, fontWeight: '800', marginLeft: 6, textTransform: 'uppercase' },

    /* Scroll Content Padding */
    scrollContent: { paddingBottom: 30 },

    /* KPI Styles */
    kpiGrid: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        marginBottom: 25 
    },
    kpiCard: { 
        width: '48%', 
        padding: 18, 
        borderRadius: 24, 
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5
    },
    darkCard: { backgroundColor: '#1e293b' },
    kpiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    kpiIconContainer: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    kpiLabelDark: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
    kpiLabelLight: { color: '#64748b', fontSize: 12, fontWeight: '700' },
    kpiValueWhite: { color: '#fff', fontSize: 18, fontWeight: '800' },
    kpiValueDark: { color: '#0f172a', fontSize: 18, fontWeight: '800' },
    unitText: { fontSize: 12, color: '#94a3b8', fontWeight: '400' },

    /* Section Styles */
    sectionCard: { 
        marginHorizontal: 20,
        backgroundColor: '#fff', 
        borderRadius: 28, 
        padding: 22, 
        shadowColor: '#000', 
        shadowOpacity: 0.05, 
        shadowRadius: 15, 
        elevation: 2 
    },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    seeAll: { color: '#10b981', fontWeight: '700', fontSize: 14 },
    asientoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    asientoIconBg: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    asientoInfo: { flex: 1 },
    glosaText: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 2 },
    fechaText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
    montoText: { fontSize: 16, fontWeight: '800', color: '#0f172a' }
});