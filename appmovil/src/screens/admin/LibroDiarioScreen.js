import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    ActivityIndicator, StatusBar, Dimensions, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

// Redux
import { resumenesadmindata } from '../../redux/admin/resumenesadmindata';
import { resumenesadminConstants } from '../../uri/admin/resumenesadmin-constants';

const { width } = Dimensions.get('window');

export default function LibroDiarioScreen({ navigation }) {
    const dispatch = useDispatch();
    
    const [asientos, setAsientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroVisible, setFiltroVisible] = useState(false);
    
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());

    const { get_listar_asientos } = useSelector(({ resumenesadmin_data }) => resumenesadmin_data);

    const loadData = useCallback(() => {
        setLoading(true);
        const query = `?mes=${mes}&anio=${anio}`;
        dispatch(resumenesadmindata(resumenesadminConstants('0', query, false).get_listar_asientos));
    }, [dispatch, mes, anio]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    useEffect(() => {
        if (get_listar_asientos?.data) {
            setAsientos(get_listar_asientos.data);
            setLoading(false);
        }
    }, [get_listar_asientos]);

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.asientoCard}
            onPress={() => navigation.navigate('DetalleAsiento', { asientoId: item.id })}
        >
            <View style={styles.cardInfo}>
                <View style={styles.iconContainer}>
                    <Ionicons name="receipt-outline" size={22} color="#10b981" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.glosaText} numberOfLines={1}>{item.glosa}</Text>
                    <View style={styles.subInfo}>
                        <Text style={styles.tipoLibro}>{item.tipo_libro}</Text>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.fechaText}>{new Date(item.fecha_asiento).toLocaleDateString()}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.amountContainer}>
                <Text style={styles.montoText}>{item.moneda} {parseFloat(item.total || 0).toFixed(2)}</Text>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.headerTitle}>Libro Diario</Text>
                        <TouchableOpacity 
                            style={styles.periodSelector} 
                            onPress={() => setFiltroVisible(true)}
                        >
                            <Text style={styles.periodText}>{meses[mes - 1]} {anio}</Text>
                            <Ionicons name="chevron-down" size={14} color="#10b981" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* --- CONTENIDO --- */}
            <View style={styles.contentBody}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#10b981" />
                        <Text style={styles.loadingText}>Consultando periodos...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={asientos || []}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            <Text style={styles.resultsCount}>{asientos.length} asientos encontrados</Text>
                        }
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Ionicons name="search-outline" size={60} color="#cbd5e1" />
                                <Text style={styles.emptyText}>No hay movimientos en este periodo.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* --- MODAL DE FILTRO (PRO) --- */}
            <Modal visible={filtroVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Periodo</Text>
                        <View style={styles.gridMeses}>
                            {meses.map((m, index) => (
                                <TouchableOpacity 
                                    key={m} 
                                    style={[styles.mesItem, mes === index + 1 && styles.mesSelected]}
                                    onPress={() => {
                                        setMes(index + 1);
                                        setFiltroVisible(false);
                                    }}
                                >
                                    <Text style={[styles.mesText, mes === index + 1 && styles.mesTextActive]}>
                                        {m.substring(0, 3)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.closeModal} onPress={() => setFiltroVisible(false)}>
                            <Text style={styles.closeModalText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    flex: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    /* Header Pro */
    headerContainer: { height: 160, position: 'relative' },
    headerBg: {
        position: 'absolute',
        top: 0,
        width: width,
        height: 160,
        backgroundColor: '#0f172a',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: { paddingHorizontal: 25, paddingTop: 60, flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    titleContainer: { flex: 1 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
    periodSelector: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    periodText: { color: '#10b981', fontSize: 14, fontWeight: '700', marginRight: 5 },

    /* Body */
    contentBody: { flex: 1, marginTop: -20 },
    listContent: { padding: 20, paddingBottom: 40 },
    resultsCount: { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    
    asientoCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#0f172a',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    cardInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconContainer: { width: 45, height: 45, borderRadius: 14, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    glosaText: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
    subInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    tipoLibro: { fontSize: 10, fontWeight: '900', color: '#10b981', textTransform: 'uppercase' },
    dot: { marginHorizontal: 6, color: '#cbd5e1' },
    fechaText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
    amountContainer: { flexDirection: 'row', alignItems: 'center' },
    montoText: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginRight: 8 },

    /* Modal Filtro */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 30, padding: 25, width: '100%', alignItems: 'center' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 20 },
    gridMeses: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
    mesItem: { width: '22%', paddingVertical: 12, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
    mesSelected: { backgroundColor: '#10b981' },
    mesText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
    mesTextActive: { color: '#fff' },
    closeModal: { marginTop: 25 },
    closeModalText: { color: '#ef4444', fontWeight: '700' },

    empty: { alignItems: 'center', marginTop: 80 },
    emptyText: { marginTop: 20, color: '#94a3b8', fontWeight: '600', textAlign: 'center' }
});