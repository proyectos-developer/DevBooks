import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    ActivityIndicator, StatusBar, Dimensions, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { resumenescontadordata } from '../../redux/contador/resumenescontadordata';
import { resumenescontadorConstants } from '../../uri/contador/resumenescontador-constants';

const { width } = Dimensions.get('window');

export default function LibroDiarioScreen({ navigation }) {

    const dispatch = useDispatch();
    
    const [libroDiario, setLibroDiario] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showPicker, setShowPicker] = useState(false);
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());

    const { get_libro_diario } = useSelector(({ resumenescontador_data }) => resumenescontador_data);

    const loadData = useCallback(() => {
        setLoading(true);
        const query = `?mes=${mes}&anio=${anio}`;
        dispatch(resumenescontadordata(resumenescontadorConstants('0', query, false).get_libro_diario));
    }, [dispatch, mes, anio]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    useEffect(() => {
        if (get_libro_diario?.data) {
            setLibroDiario(get_libro_diario.data);
            setLoading(false);
        }
    }, [get_libro_diario]);

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('DetalleAsiento', { asientoId: item.id })}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="receipt-outline" size={24} color="#10b981" />
            </View>
            <View style={styles.content}>
                <Text style={styles.glosa} numberOfLines={1}>{item.glosa}</Text>
                <Text style={styles.subText}>{item.tipo_libro} • {new Date(item.fecha_asiento).toLocaleDateString()}</Text>
            </View>
            <View style={styles.rightContent}>
                <Text style={styles.total}>{item.moneda} {parseFloat(item.total).toFixed(2)}</Text>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO CON FILTRO --- */}
            <View style={styles.header}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerTitle}>Libro Diario</Text>
                            <TouchableOpacity 
                                style={styles.periodSelector} 
                                onPress={() => setShowPicker(true)}
                            >
                                <Text style={styles.periodText}>{meses[mes-1]} {anio}</Text>
                                <Ionicons name="chevron-down" size={14} color="#10b981" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.searchBtn}>
                            <Ionicons name="search-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#10b981" />
                    <Text style={styles.loaderText}>Filtrando periodo...</Text>
                </View>
            ) : (
                <FlatList
                    data={libroDiario || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={<Text style={styles.resultsCount}>{libroDiario.length} movimientos encontrados</Text>}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="archive-outline" size={60} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No hay asientos para este periodo</Text>
                        </View>
                    }
                />
            )}

            {/* --- MODAL SELECTOR DE PERIODO --- */}
            <Modal visible={showPicker} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Mes</Text>
                        <View style={styles.monthGrid}>
                            {meses.map((m, index) => (
                                <TouchableOpacity 
                                    key={m} 
                                    style={[styles.monthItem, mes === index + 1 && styles.monthSelected]}
                                    onPress={() => {
                                        setMes(index + 1);
                                        setShowPicker(false);
                                    }}
                                >
                                    <Text style={[styles.monthText, mes === index + 1 && styles.monthTextActive]}>
                                        {m.substring(0, 3)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowPicker(false)}>
                            <Text style={styles.closeBtnText}>Cerrar</Text>
                        </TouchableOpacity>
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
    header: { height: 180, position: 'relative' },
    headerBg: { 
        position: 'absolute', top: 0, width: width, height: 180, 
        backgroundColor: '#0f172a', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 
    },
    headerContent: { paddingHorizontal: 25, paddingTop: 60 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
    periodSelector: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    periodText: { color: '#10b981', fontSize: 15, fontWeight: '700', marginRight: 6 },
    searchBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

    /* Listado */
    list: { padding: 20, paddingBottom: 120 },
    resultsCount: { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    card: { 
        flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 24, 
        marginBottom: 12, alignItems: 'center', elevation: 2, shadowColor: '#0f172a', shadowOpacity: 0.05, shadowRadius: 10 
    },
    iconContainer: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    content: { flex: 1 },
    glosa: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
    subText: { fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: '700', textTransform: 'uppercase' },
    rightContent: { flexDirection: 'row', alignItems: 'center' },
    total: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginRight: 8 },

    /* Modal Filtro */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', width: width * 0.85, borderRadius: 30, padding: 25, alignItems: 'center' },
    modalTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 20 },
    monthGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
    monthItem: { width: '22%', paddingVertical: 12, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
    monthSelected: { backgroundColor: '#10b981' },
    monthText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    monthTextActive: { color: '#fff' },
    closeBtn: { marginTop: 20, padding: 10 },
    closeBtnText: { color: '#ef4444', fontWeight: '800' },

    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { marginTop: 15, color: '#94a3b8', fontWeight: '600' }
});