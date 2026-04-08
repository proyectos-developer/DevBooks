import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    StatusBar, Dimensions, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

// Redux Actions & Constants
import { reportesclientedata } from '../../redux/cliente/reportesclientedata.js';
import { reportesclienteConstants } from '../../uri/cliente/reportescliente-constants.js';

const { width } = Dimensions.get('window');

export default function DetalleReporteScreen({ route, navigation }) {

    const { id_periodo, mes_nombre, anio } = route.params;

    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [detalle, setDetalle] = useState(null);

    // Selector de Redux
    const { get_detalle_reporte } = useSelector(({ reportescliente_data }) => reportescliente_data);

    useFocusEffect(
        useCallback(() => {
            fetchDetalle();
        }, [id_periodo])
    );

    const fetchDetalle = () => {
        setLoading(true);
        dispatch(reportesclientedata(
            reportesclienteConstants(id_periodo, {}, false).get_detalle_reporte
        ));
    };

    useEffect(() => {
        if (get_detalle_reporte?.data) {
            setDetalle(get_detalle_reporte.data);
            setLoading(false);
        }
    }, [get_detalle_reporte]);

    // Cálculo del IGV Estimado basado en la data del backend
    const totalVentas = parseFloat(detalle?.total_ventas || 0);
    const totalCompras = parseFloat(detalle?.total_compras || 0);
    const igvEstimado = totalVentas - totalCompras;

    if (loading) {
        return (
            <View style={styles.centerLoader}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loaderText}>Cargando resumen detallado...</Text>
            </View>
        );
    }

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
                        <Text style={styles.headerTitle}>Detalle del Periodo</Text>
                        <Text style={styles.headerSub}>{mes_nombre} {anio}</Text>
                    </View>
                </View>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Resumen de Impuestos Card */}
                <View style={styles.cardHighlight}>
                    <Text style={styles.highlightLabel}>IGV ESTIMADO</Text>
                    <Text style={styles.highlightAmount}>
                        S/ {igvEstimado.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: igvEstimado > 0 ? '#f59e0b' : '#10b981' }]}>
                        <Text style={styles.statusText}>
                            {igvEstimado > 0 ? 'PENDIENTE DE PAGO' : 'SALDO A FAVOR'}
                        </Text>
                    </View>
                </View>

                {/* Desglose Gráfico Simple */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Composición del mes</Text>
                    <View style={styles.dataCard}>
                        <DataRow 
                            label="Total Ventas" 
                            value={totalVentas} 
                            count={detalle?.cant_ventas}
                            color="#10b981" 
                            icon="arrow-up-circle" 
                        />
                        <View style={styles.divider} />
                        <DataRow 
                            label="Total Compras" 
                            value={totalCompras} 
                            count={detalle?.cant_compras}
                            color="#ef4444" 
                            icon="arrow-down-circle" 
                        />
                    </View>
                </View>

                {/* Caja Informativa */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#64748b" />
                    <Text style={styles.infoText}>
                        Estos datos corresponden a la propuesta SIRE de SUNAT procesada por DevBooks. Consulte con su contador para la declaración final.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const DataRow = ({ label, value, count, color, icon }) => (
    <View style={styles.dataRow}>
        <View style={[styles.iconBg, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowCount}>{count || 0} comprobantes</Text>
        </View>
        <Text style={styles.rowValue}>S/ {parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    loaderText: { marginTop: 10, color: '#64748b', fontWeight: '600' },
    
    headerContainer: { height: 170, position: 'absolute', top: 0, width: '100%', zIndex: 10 },
    headerBg: { position: 'absolute', width: width, height: 170, backgroundColor: '#0f172a', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerContent: { paddingHorizontal: 25, paddingTop: 60, flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
    headerSub: { color: '#10b981', fontSize: 13, fontWeight: '600' },
    
    scrollContent: { paddingHorizontal: 25, paddingTop: 180, paddingBottom: 140 },
    
    cardHighlight: { backgroundColor: '#0f172a', borderRadius: 30, padding: 30, alignItems: 'center', marginBottom: 25, elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
    highlightLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    highlightAmount: { color: '#fff', fontSize: 36, fontWeight: '900', marginVertical: 12 },
    statusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    statusText: { color: '#fff', fontSize: 11, fontWeight: '900' },

    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 15, marginLeft: 5 },
    dataCard: { backgroundColor: '#fff', borderRadius: 28, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15 },
    dataRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    iconBg: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    rowContent: { flex: 1, marginLeft: 15 },
    rowLabel: { fontSize: 14, color: '#1e293b', fontWeight: '800' },
    rowCount: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
    rowValue: { fontSize: 16, fontWeight: '900', color: '#1e293b' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 5 },
    
    infoBox: { flexDirection: 'row', padding: 20, backgroundColor: '#fff', borderRadius: 25, marginTop: 15, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' },
    infoText: { flex: 1, marginLeft: 12, fontSize: 12, color: '#64748b', lineHeight: 18, fontWeight: '500' }
});