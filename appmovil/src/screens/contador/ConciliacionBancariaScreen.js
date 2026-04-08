import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    StatusBar, Dimensions, ActivityIndicator, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { bancoscontadordata } from '../../redux/contador/bancoscontadordata';
import { bancoscontadorConstants } from '../../uri/contador/bancoscontador-constants';

const { width } = Dimensions.get('window');

export default function ConciliacionBancariaScreen({ route, navigation }) {
    const { cuentaId } = route.params;
    const dispatch = useDispatch();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const { get_movimientos_banco } = useSelector(({ bancoscontador_data }) => bancoscontador_data);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [dispatch, cuentaId])
    );

    const fetchData = () => {
        setLoading(true);
        dispatch(bancoscontadordata(bancoscontadorConstants(cuentaId, {}, false).get_movimientos_banco));
    };

    useEffect(() => {
        if (get_movimientos_banco?.data) {
            setData(get_movimientos_banco.data);
            setLoading(false);
        }
    }, [get_movimientos_banco]);

    const renderMovimiento = ({ item }) => {
        const isIngreso = item.monto > 0;
        const isConciliado = item.estado_conciliacion === 1;

        return (
            <TouchableOpacity 
                style={[styles.card, isConciliado && styles.cardConciliado]}
                activeOpacity={0.7}
                disabled={isConciliado}
            >
                {/* Indicador lateral de estado */}
                <View style={[styles.statusIndicator, { backgroundColor: isIngreso ? '#10b981' : '#ef4444' }]} />
                
                <View style={styles.infoCol}>
                    <Text style={styles.fechaText}>
                        {new Date(item.fecha_operacion).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                    <Text style={styles.descText} numberOfLines={2}>{item.descripcion_banco}</Text>
                    <View style={styles.refRow}>
                        <Ionicons name="barcode-outline" size={12} color="#94a3b8" />
                        <Text style={styles.refText}> {item.referencia_operacion || 'Sin Referencia'}</Text>
                    </View>
                </View>
                
                <View style={styles.amountCol}>
                    <Text style={[styles.monto, isIngreso ? styles.ingreso : styles.egreso]}>
                        {isIngreso ? '+' : ''}{parseFloat(item.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </Text>
                    
                    <View style={[styles.statusBadge, isConciliado ? styles.badgeSuccess : styles.badgePending]}>
                        <Ionicons 
                            name={isConciliado ? "checkmark-circle" : "time-outline"} 
                            size={12} 
                            color={isConciliado ? "#059669" : "#64748b"} 
                        />
                        <Text style={[styles.statusBadgeText, { color: isConciliado ? "#059669" : "#64748b" }]}>
                            {isConciliado ? ' CONCILIADO' : ' PENDIENTE'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !data) return (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loaderText}>Sincronizando con el banco...</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO FIJO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <View style={styles.topRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.titleArea}>
                            <Text style={styles.headerTitle} numberOfLines={1}>{data?.cuenta?.banco}</Text>
                            <Text style={styles.headerSub}>
                                {data?.cuenta?.pcge_codigo} • Tesorería
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
                            <Ionicons name="refresh" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Quick Stats del Banco */}
                    <View style={styles.quickStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>PENDIENTES</Text>
                            <Text style={styles.statValue}>
                                {data?.movimientos?.length > 0 && data?.movimientos.filter(m => m.estado_conciliacion === 0).length}
                            </Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>MONEDA</Text>
                            <Text style={styles.statValue}>{data?.cuenta?.moneda}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <FlatList 
                data={data?.movimientos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMovimiento}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.accountInfoCard}>
                        <View style={styles.accIconBg}>
                            <Ionicons name="card" size={24} color="#10b981" />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.accLabel}>Número de Cuenta</Text>
                            <Text style={styles.accValue}>{data?.cuenta?.numero_cuenta}</Text>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Ionicons name="file-tray-outline" size={60} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No hay movimientos registrados en esta cuenta.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 12, color: '#64748b', fontWeight: '600' },

    /* Header Pro */
    headerContainer: { height: 230, position: 'absolute', top: 0, width: '100%', zIndex: 10 },
    headerBg: { 
        position: 'absolute', width: width, height: 230, 
        backgroundColor: '#0f172a', borderBottomLeftRadius: 45, borderBottomRightRadius: 45 
    },
    headerContent: { paddingHorizontal: 25, paddingTop: 55 },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { 
        width: 42, height: 42, borderRadius: 14, 
        backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' 
    },
    titleArea: { flex: 1, marginHorizontal: 15 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
    headerSub: { color: '#10b981', fontSize: 13, fontWeight: '600', marginTop: 2 },
    refreshBtn: { padding: 5 },

    quickStats: { 
        flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', 
        marginTop: 25, borderRadius: 20, padding: 15, alignItems: 'center' 
    },
    statItem: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
    statLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    statValue: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 4 },

    /* Listado */
    listContent: { 
        paddingHorizontal: 20, 
        paddingTop: 245, // Espacio para el header fijo
        paddingBottom: 120 // Espacio para el Bottom Tab flotante
    },
    accountInfoCard: { 
        flexDirection: 'row', backgroundColor: '#fff', padding: 20, 
        borderRadius: 25, marginBottom: 20, alignItems: 'center', elevation: 4,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10
    },
    accIconBg: { 
        width: 48, height: 48, borderRadius: 16, backgroundColor: '#f0fdf4', 
        justifyContent: 'center', alignItems: 'center', marginRight: 15 
    },
    accLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    accValue: { color: '#0f172a', fontSize: 17, fontWeight: '900', marginTop: 3 },

    /* Cards de Movimientos */
    card: { 
        backgroundColor: '#fff', borderRadius: 24, padding: 16, marginBottom: 12, 
        flexDirection: 'row', alignItems: 'center', elevation: 2, overflow: 'hidden',
        shadowColor: '#0f172a', shadowOpacity: 0.05, shadowRadius: 8
    },
    statusIndicator: { position: 'absolute', left: 0, height: '150%', width: 5 },
    cardConciliado: { opacity: 0.6, backgroundColor: '#f1f5f9' },
    infoCol: { flex: 1, paddingLeft: 10 },
    fechaText: { fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 4 },
    descText: { fontSize: 14, fontWeight: '800', color: '#1e293b', lineHeight: 18 },
    refRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    refText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
    
    amountCol: { alignItems: 'flex-end', width: 120 },
    monto: { fontSize: 16, fontWeight: '900', marginBottom: 8 },
    ingreso: { color: '#10b981' },
    egreso: { color: '#1e293b' },
    
    statusBadge: { 
        flexDirection: 'row', alignItems: 'center', 
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 
    },
    badgePending: { backgroundColor: '#f1f5f9' },
    badgeSuccess: { backgroundColor: '#d1fae5' },
    statusBadgeText: { fontSize: 9, fontWeight: '900' },

    emptyBox: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#94a3b8', fontWeight: '600', marginTop: 15, textAlign: 'center', paddingHorizontal: 40 }
});