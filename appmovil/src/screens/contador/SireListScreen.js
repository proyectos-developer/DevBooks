import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, FlatList, 
    Dimensions, StatusBar, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

// Redux Actions & Constants
import {sirecontadordata} from '../../redux/contador/sirecontadordata.js'
import { sirecontadorConstants } from '../../uri/contador/sirecontador-constants';

const { width } = Dimensions.get('window');

export default function SireListScreen({navigation}) {

    const dispatch = useDispatch();
  
    const [tab, setTab] = useState('VENTAS'); // 'VENTAS' o 'COMPRAS'
    const [loading, setLoading] = useState(true);

    const { get_sire_resumenes } = useSelector(({ sirecontador_data }) => sirecontador_data);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [dispatch])
    );

    const loadData = () => {
        setLoading(true);
        const mesActual = new Date().getMonth() + 1;
        const anioActual = new Date().getFullYear();
        const query = `?mes=${mesActual}&anio=${anioActual}`
        dispatch(sirecontadordata(sirecontadorConstants('0', query, false).get_sire_resumenes));
    };

    useEffect(() => {
        if (get_sire_resumenes?.data) {
            setLoading(false);
        }
    }, [get_sire_resumenes]);

    // Filtrar data según el Tab activo
    const dataDisplay = tab === 'VENTAS' 
        ? get_sire_resumenes?.data?.ventas 
        : get_sire_resumenes?.data?.compras;

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card}
            onPress={() => navigation.navigate ('SireDetalle', {docId: item.id, tipo: tab.toLowerCase()})}>
            <View style={styles.cardHeader}>
                <Text style={styles.rucText}>
                    RUC: {item.ruc_emisor || item.ruc_proveedor}
                </Text>
                <View style={[
                    styles.badge, 
                    { backgroundColor: item.id_asiento_detalle ? '#dcfce7' : '#fee2e2' }
                ]}>
                    <Text style={[
                        styles.badgeText, 
                        { color: item.id_asiento_detalle ? '#166534' : '#ef4444' }
                    ]}>
                        {item.id_asiento_detalle ? 'VINCULADO' : 'PENDIENTE'}
                    </Text>
                </View>
            </View>
            
            <Text style={styles.razonSocial}>
                {item.razon_social_cliente || item.razon_social_proveedor}
            </Text>
            
            <View style={styles.cardFooter}>
                <View style={styles.docInfo}>
                    <Ionicons name="document-outline" size={14} color="#64748b" />
                    <Text style={styles.docText}> {item.serie}-{item.numero}</Text>
                </View>
                <Text style={styles.montoText}>
                    S/ {parseFloat(item.monto_total).toFixed(2)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <View style={styles.headerPro}>
                <Text style={styles.title}>Propuesta SIRE</Text>
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, tab === 'VENTAS' && styles.tabActive]} 
                        onPress={() => setTab('VENTAS')}
                    >
                        <Text style={[styles.tabText, tab === 'VENTAS' && styles.tabTextActive]}>
                            RVIE (Ventas)
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, tab === 'COMPRAS' && styles.tabActive]} 
                        onPress={() => setTab('COMPRAS')}
                    >
                        <Text style={[styles.tabText, tab === 'COMPRAS' && styles.tabTextActive]}>
                            RCE (Compras)
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#10b981" />
                    <Text style={styles.loaderText}>Consultando propuestas SUNAT...</Text>
                </View>
            ) : (
                <FlatList 
                    data={dataDisplay || []}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="cloud-offline-outline" size={50} color="#cbd5e1" />
                            <Text style={styles.empty}>No hay documentos en la propuesta del periodo.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerPro: { 
        backgroundColor: '#0f172a', 
        paddingHorizontal: 25, 
        paddingTop: 60, 
        paddingBottom: 25,
        borderBottomLeftRadius: 35, 
        borderBottomRightRadius: 35,
        elevation: 10
    },
    title: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
    tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 5 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    tabActive: { backgroundColor: '#10b981' },
    tabText: { color: '#94a3b8', fontWeight: '700', fontSize: 13 },
    tabTextActive: { color: '#fff' },
    
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 10, color: '#64748b', fontWeight: '600' },
    
    list: { padding: 20, paddingBottom: 100 },
    card: { 
        backgroundColor: '#fff', 
        padding: 18, 
        borderRadius: 22, 
        marginBottom: 15, 
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    rucText: { color: '#94a3b8', fontSize: 11, fontWeight: '700' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 10, fontWeight: '900' },
    razonSocial: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 12 },
    cardFooter: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderTopWidth: 1, 
        borderTopColor: '#f1f5f9', 
        paddingTop: 12 
    },
    docInfo: { flexDirection: 'row', alignItems: 'center' },
    docText: { color: '#64748b', fontWeight: '700', fontSize: 13 },
    montoText: { color: '#0f172a', fontSize: 16, fontWeight: '900' },
    
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    empty: { textAlign: 'center', marginTop: 10, color: '#94a3b8', fontWeight: '600' }
});