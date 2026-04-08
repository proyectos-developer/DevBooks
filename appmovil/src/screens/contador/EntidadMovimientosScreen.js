import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    StatusBar, Dimensions, ActivityIndicator, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { entidadescontadordata } from '../../redux/contador/entidadescontadordata';
import { entidadescontadorConstants } from '../../uri/contador/entidadescontador-constants';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function EntidadMovimientosScreen({ route, navigation }) {
    const { entidadId, nombreEntidad } = route.params;
    const dispatch = useDispatch();

    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);

    const { get_movimientos_entidad } = useSelector(({ entidadescontador_data }) => entidadescontador_data);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [dispatch, entidadId])
    );

    const loadData = () => {
        setLoading(true);
        dispatch(entidadescontadordata(entidadescontadorConstants(entidadId, {}, false).get_movimientos_entidad));
    };

    useEffect(() => {
        if (get_movimientos_entidad?.data) {
            setMovimientos(get_movimientos_entidad.data);
            setLoading(false);
        }
    }, [get_movimientos_entidad]);

    const renderItem = ({ item }) => {
        const isDebe = item.debe > 0;
        return (
            <TouchableOpacity 
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('DetalleAsiento', { asientoId: item.id_asiento })}
            >
                <View style={[styles.indicator, { backgroundColor: isDebe ? '#1e293b' : '#10b981' }]} />
                
                <View style={styles.dateContainer}>
                    <Text style={styles.dateDay}>{new Date(item.fecha_asiento).getDate()}</Text>
                    <Text style={styles.dateMonth}>
                        {new Date(item.fecha_asiento).toLocaleString('es-ES', { month: 'short' }).toUpperCase()}
                    </Text>
                </View>

                <View style={styles.mainContent}>
                    <Text style={styles.glosaText} numberOfLines={1}>{item.glosa}</Text>
                    <View style={styles.voucherRow}>
                        <Ionicons name="document-text-outline" size={12} color="#94a3b8" />
                        <Text style={styles.voucherText}>{item.serie_comprobante}-{item.numero_comprobante}</Text>
                    </View>
                </View>

                <View style={styles.priceContainer}>
                    <Text style={[styles.priceText, { color: isDebe ? '#1e293b' : '#10b981' }]}>
                        S/ {isDebe ? parseFloat(item.debe).toFixed(2) : parseFloat(item.haber).toFixed(2)}
                    </Text>
                    <View style={[styles.typeBadge, { backgroundColor: isDebe ? '#f1f5f9' : '#f0fdf4' }]}>
                        <Text style={[styles.typeText, { color: isDebe ? '#475569' : '#166534' }]}>
                            {isDebe ? 'CARGO' : 'ABONO'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO FIJO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <View style={styles.navBar}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
                            <Ionicons name="arrow-back" size={22} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.titleArea}>
                            <Text style={styles.headerTitle}>Historial Contable</Text>
                            <Text style={styles.headerSubTitle} numberOfLines={1}>{nombreEntidad}</Text>
                        </View>
                        <TouchableOpacity style={styles.iconCircle} onPress={loadData}>
                            <Ionicons name="refresh" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Resumen rápido en el Header */}
                    <View style={styles.quickStats}>
                        <Text style={styles.statsLabel}>Movimientos registrados en el periodo</Text>
                        <Text style={styles.statsValue}>{movimientos.length} documentos</Text>
                    </View>
                </View>
            </View>

            {loading ? (
                <View style={styles.loaderArea}>
                    <ActivityIndicator size="large" color="#10b981" />
                    <Text style={styles.loaderText}>Sincronizando movimientos...</Text>
                </View>
            ) : (
                <FlatList 
                    data={movimientos}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.scrollList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Ionicons name="receipt-outline" size={60} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No se encontraron movimientos para esta entidad.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    
    /* Header Pro */
    headerContainer: { 
        height: 220, 
        position: 'absolute', 
        top: 0, 
        width: '100%', 
        zIndex: 10 
    },
    headerBg: { 
        position: 'absolute', 
        width: width, 
        height: 220, 
        backgroundColor: '#0f172a', 
        borderBottomLeftRadius: 45, 
        borderBottomRightRadius: 45 
    },
    headerContent: { paddingHorizontal: 25, paddingTop: 55 },
    navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconCircle: { 
        width: 42, 
        height: 42, 
        borderRadius: 14, 
        backgroundColor: 'rgba(255,255,255,0.12)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    titleArea: { flex: 1, marginHorizontal: 15 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
    headerSubTitle: { color: '#10b981', fontSize: 13, fontWeight: '600', marginTop: 2 },
    
    quickStats: { marginTop: 30, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 15, borderRadius: 20, borderLeftWidth: 4, borderLeftColor: '#10b981' },
    statsLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    statsValue: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 4 },

    /* Listado */
    scrollList: { 
        paddingHorizontal: 20, 
        paddingTop: 240, 
        paddingBottom: 110 
    },
    loaderArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 10, color: '#64748b', fontWeight: '600' },

    /* Cards */
    card: { 
        flexDirection: 'row', 
        backgroundColor: '#fff', 
        borderRadius: 24, 
        marginBottom: 12, 
        alignItems: 'center', 
        padding: 16,
        paddingLeft: 12,
        elevation: 3,
        shadowColor: '#0f172a',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        overflow: 'hidden'
    },
    indicator: { 
        position: 'absolute', 
        left: 0, 
        height: '100%', 
        width: 5 
    },
    dateContainer: { 
        alignItems: 'center', 
        justifyContent: 'center',
        width: 50,
        borderRightWidth: 1,
        borderRightColor: '#f1f5f9'
    },
    dateDay: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    dateMonth: { fontSize: 10, fontWeight: '700', color: '#94a3b8' },
    
    mainContent: { flex: 1, paddingHorizontal: 15 },
    glosaText: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
    voucherRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    voucherText: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginLeft: 5 },
    
    priceContainer: { alignItems: 'flex-end' },
    priceText: { fontSize: 16, fontWeight: '900' },
    typeBadge: { 
        paddingHorizontal: 8, 
        paddingVertical: 4, 
        borderRadius: 8, 
        marginTop: 6 
    },
    typeText: { fontSize: 9, fontWeight: '900' },

    emptyBox: { alignItems: 'center', marginTop: 60 },
    emptyText: { marginTop: 15, color: '#94a3b8', fontWeight: '600', textAlign: 'center', paddingHorizontal: 40 }
});