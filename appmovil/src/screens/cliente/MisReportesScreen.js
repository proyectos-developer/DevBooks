import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    StatusBar, Dimensions, ActivityIndicator, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

// Redux
import { reportesclientedata } from '../../redux/cliente/reportesclientedata.js';
import { reportesclienteConstants } from '../../uri/cliente/reportescliente-constants.js';

const { width } = Dimensions.get('window');

export default function MisReportesScreen({ navigation }) {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

    // Obtener datos de Redux
    const { get_reportes_sire } = useSelector(({ reportescliente_data }) => reportescliente_data);

    // Lista de años para el filtro
    const aniosFiltro = [2024, 2025, 2026];

    useFocusEffect(
        useCallback(() => {
            fetchReportes();
        }, [anioSeleccionado])
    );

    const fetchReportes = () => {
        setLoading(true);
        const query = `?anio=${anioSeleccionado}`;
        dispatch(reportesclientedata(reportesclienteConstants('0', query, false).get_reportes_sire));
    };

    useEffect(() => {
        if (get_reportes_sire) {
            setLoading(false);
        }
    }, [get_reportes_sire]);

    const getMesNombre = (m) => ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][m - 1];

    const renderItem = ({ item }) => {
        const igvNeto = (item.igv_ventas || 0) - (item.igv_compras || 0);
        const mesTxt = getMesNombre(item.mes);
        
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.periodoInfo}>
                        <Ionicons name="calendar-outline" size={16} color="#10b981" />
                        <Text style={styles.mesText}> {mesTxt} {item.anio}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: item.cerrado ? '#f1f5f9' : '#dcfce7' }]}>
                        <Text style={[styles.badgeText, { color: item.cerrado ? '#64748b' : '#10b981' }]}>
                            {item.cerrado ? 'CERRADO' : 'EN CURSO'}
                        </Text>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Ventas (RVIE)</Text>
                        <Text style={styles.value}>S/ {parseFloat(item.total_ventas || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>Compras (RCE)</Text>
                        <Text style={styles.value}>S/ {parseFloat(item.total_compras || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
                    </View>
                </View>

                <View style={styles.footerCard}>
                    <View style={styles.igvInfo}>
                        <Text style={styles.igvLabel}>IGV Proyectado</Text>
                        <Text style={[styles.igvValue, { color: igvNeto > 0 ? '#ef4444' : '#10b981' }]}>
                            S/ {Math.abs(igvNeto).toLocaleString(undefined, {minimumFractionDigits: 2})} 
                            <Text style={styles.igvStatus}> {igvNeto > 0 ? '(Por Pagar)' : '(A Favor)'}</Text>
                        </Text>
                    </View>
                    
                    {/* ACCIÓN: Navegar al detalle pasando el ID del periodo y nombres para el Header */}
                    <TouchableOpacity 
                        style={styles.detailBtn}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('DetalleReporte', { 
                            id_periodo: item.id_periodo, 
                            mes_nombre: mesTxt, 
                            anio: item.anio 
                        })}
                    >
                        <Ionicons name="chevron-forward-circle" size={32} color="#0f172a" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO CON FILTRO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Mis Reportes</Text>
                    <Text style={styles.headerSub}>Resumen tributario SIRE</Text>
                    
                    <View style={styles.filterWrapper}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                            {aniosFiltro.map((anio) => (
                                <TouchableOpacity 
                                    key={anio} 
                                    onPress={() => setAnioSeleccionado(anio)}
                                    style={[styles.anioBtn, anioSeleccionado === anio && styles.anioBtnActive]}
                                >
                                    <Text style={[styles.anioText, anioSeleccionado === anio && styles.anioTextActive]}>
                                        {anio}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#10b981" />
                    <Text style={styles.loaderText}>Consultando periodos...</Text>
                </View>
            ) : (
                <FlatList 
                    data={get_reportes_sire?.data || []}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.scrollList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={60} color="#cbd5e1" />
                            <Text style={styles.empty}>No hay reportes disponibles para el año {anioSeleccionado}.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerContainer: { height: 230, position: 'absolute', top: 0, width: '100%', zIndex: 10 },
    headerBg: { position: 'absolute', width: width, height: 230, backgroundColor: '#0f172a', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerContent: { paddingHorizontal: 25, paddingTop: 60 },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
    headerSub: { color: '#10b981', fontSize: 13, fontWeight: '600', marginBottom: 20 },
    filterWrapper: { marginTop: 5 },
    filterScroll: { paddingRight: 20 },
    anioBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', marginRight: 10 },
    anioBtnActive: { backgroundColor: '#10b981' },
    anioText: { color: '#94a3b8', fontWeight: '800', fontSize: 14 },
    anioTextActive: { color: '#fff' },
    scrollList: { paddingHorizontal: 20, paddingTop: 240, paddingBottom: 130 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 10, color: '#64748b', fontWeight: '600' },
    card: { backgroundColor: '#fff', borderRadius: 28, padding: 20, marginBottom: 15, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
    periodoInfo: { flexDirection: 'row', alignItems: 'center' },
    mesText: { fontSize: 17, fontWeight: '900', color: '#1e293b' },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    badgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
    row: { flexDirection: 'row', marginBottom: 18 },
    col: { flex: 1 },
    label: { fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    value: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginTop: 4 },
    footerCard: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    igvInfo: { flex: 1 },
    igvLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 2 },
    igvValue: { fontSize: 15, fontWeight: '900' },
    igvStatus: { fontSize: 11, fontWeight: '700' },
    detailBtn: { marginLeft: 10 },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    empty: { textAlign: 'center', marginTop: 15, color: '#94a3b8', fontWeight: '600', width: '80%' }
});