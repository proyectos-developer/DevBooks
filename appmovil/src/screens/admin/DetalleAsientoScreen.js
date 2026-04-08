import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, ActivityIndicator, 
    StatusBar, Dimensions, TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

// Redux
import { resumenesadmindata } from '../../redux/admin/resumenesadmindata';
import { resumenesadminConstants } from '../../uri/admin/resumenesadmin-constants';

const { width } = Dimensions.get('window');

export default function DetalleAsientoScreen({ navigation, route }) {
    const { asientoId } = route.params;
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [asiento, setAsiento] = useState(null);

    const { get_asiento_detalles } = useSelector(({ resumenesadmin_data }) => resumenesadmin_data);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [dispatch, asientoId])
    );

    const loadData = () => {
        dispatch(resumenesadmindata(resumenesadminConstants(asientoId, {}, false).get_asiento_detalles));
    };

    useEffect(() => {
        if (get_asiento_detalles?.data) {
            setAsiento(get_asiento_detalles.data);
            setLoading(false);
        }
    }, [get_asiento_detalles]);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loaderText}>Cargando Voucher...</Text>
            </View>
        );
    }

    if (!asiento) return <Text style={styles.errorTextCenter}>No se encontró información del asiento.</Text>;

    const { cabecera, movimientos, cuadre } = asiento;

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO DECORATIVO --- */}
            <View style={styles.headerBg} />
            
            <View style={styles.headerContent}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Voucher Contable</Text>
                    <Text style={styles.headerSubtitle}>Detalle de Asiento Diario</Text>
                </View>
            </View>

            <ScrollView 
                style={styles.flex} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* --- CARD PRINCIPAL DE CABECERA --- */}
                <View style={styles.voucherCard}>
                    <View style={styles.badgeContainer}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{cabecera.tipo_libro || 'DIARIO'}</Text>
                        </View>
                        <Text style={styles.asientoIdText}>#{asientoId}</Text>
                    </View>

                    <Text style={styles.glosaTitle}>{cabecera.glosa}</Text>

                    <View style={styles.divider} />

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Fecha de Emisión</Text>
                            <Text style={styles.infoValue}>{new Date(cabecera.fecha_asiento).toLocaleDateString()}</Text>
                        </View>
                        <View style={[styles.infoItem, { alignItems: 'flex-end' }]}>
                            <Text style={styles.infoLabel}>Periodo Fiscal</Text>
                            <Text style={styles.infoValue}>{cabecera.mes.toString().padStart(2, '0')}-{cabecera.anio}</Text>
                        </View>
                    </View>
                </View>

                {/* --- TABLA DE MOVIMIENTOS --- */}
                <View style={styles.tableCard}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.colTitle, { flex: 2.5 }]}>Cuenta Contable</Text>
                        <Text style={[styles.colTitle, { flex: 1, textAlign: 'right' }]}>Debe</Text>
                        <Text style={[styles.colTitle, { flex: 1, textAlign: 'right' }]}>Haber</Text>
                    </View>

                    {movimientos.map((mov, index) => (
                        <View key={index} style={[styles.tableRow, index === movimientos.length - 1 && { borderBottomWidth: 0 }]}>
                            <View style={{ flex: 2.5 }}>
                                <Text style={styles.cuentaCode}>{mov.cuenta_codigo}</Text>
                                <Text style={styles.cuentaDesc} numberOfLines={1}>{mov.cuenta_nombre}</Text>
                                {mov.entidad_nombre && (
                                    <View style={styles.refContainer}>
                                        <Ionicons name="business-outline" size={10} color="#94a3b8" />
                                        <Text style={styles.entidadText}>{mov.entidad_nombre}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={[styles.montoText, { flex: 1 }]}>
                                {parseFloat(mov.debe) > 0 ? parseFloat(mov.debe).toFixed(2) : '-'}
                            </Text>
                            <Text style={[styles.montoText, { flex: 1 }]}>
                                {parseFloat(mov.haber) > 0 ? parseFloat(mov.haber).toFixed(2) : '-'}
                            </Text>
                        </View>
                    ))}

                    {/* --- FOOTER TOTALES --- */}
                    <View style={styles.tableFooter}>
                        <Text style={styles.totalLabel}>TOTAL {cabecera.moneda}</Text>
                        <Text style={styles.totalAmount}>{parseFloat(cuadre.totalDebe).toFixed(2)}</Text>
                        <Text style={styles.totalAmount}>{parseFloat(cuadre.totalHaber).toFixed(2)}</Text>
                    </View>
                </View>

                {/* --- ESTADO DE CUADRE --- */}
                <View style={[
                    styles.cuadreStatus, 
                    { backgroundColor: parseFloat(cuadre.diferencia) === 0 ? '#f0fdf4' : '#fef2f2' }
                ]}>
                    <Ionicons 
                        name={parseFloat(cuadre.diferencia) === 0 ? "checkmark-circle" : "warning"} 
                        size={20} 
                        color={parseFloat(cuadre.diferencia) === 0 ? "#10b981" : "#ef4444"} 
                    />
                    <Text style={[
                        styles.cuadreText, 
                        { color: parseFloat(cuadre.diferencia) === 0 ? "#166534" : "#991b1b" }
                    ]}>
                        {parseFloat(cuadre.diferencia) === 0 
                            ? "Asiento Cuadrado (Partida Doble)" 
                            : `Descuadre detectado: S/ ${cuadre.diferencia}`}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#f8fafc' },
    flex: { flex: 1 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 10, color: '#64748b', fontWeight: '600' },
    
    /* Header Styles */
    headerBg: {
        position: 'absolute',
        top: 0,
        width: width,
        height: 200,
        backgroundColor: '#0f172a',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingTop: 50,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTextContainer: { flex: 1 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
    headerSubtitle: { color: '#10b981', fontSize: 13, fontWeight: '600' },

    /* Scroll Content */
    scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

    /* Voucher Card */
    voucherCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 15,
        elevation: 4,
        marginBottom: 20,
    },
    badgeContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    badge: { backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '900' },
    asientoIdText: { color: '#94a3b8', fontWeight: '700', fontSize: 14 },
    glosaTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', lineHeight: 24 },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
    infoGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    infoLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
    infoValue: { color: '#475569', fontSize: 14, fontWeight: '700' },

    /* Table Styles */
    tableCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    colTitle: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f8fafc', alignItems: 'center' },
    cuentaCode: { fontSize: 13, fontWeight: '800', color: '#10b981' },
    cuentaDesc: { fontSize: 12, color: '#64748b', fontWeight: '500', marginTop: 2 },
    refContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    entidadText: { fontSize: 10, color: '#94a3b8', marginLeft: 4, fontStyle: 'italic' },
    montoText: { fontSize: 13, fontWeight: '700', color: '#1e293b', textAlign: 'right' },
    
    tableFooter: { flexDirection: 'row', backgroundColor: '#1e293b', padding: 15, alignItems: 'center' },
    totalLabel: { flex: 2.5, color: '#fff', fontSize: 12, fontWeight: '800' },
    totalAmount: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '900', textAlign: 'right' },

    /* Status Cuadre */
    cuadreStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 18,
        marginTop: 20,
    },
    cuadreText: { marginLeft: 10, fontSize: 13, fontWeight: '700' },
    errorTextCenter: { textAlign: 'center', marginTop: 50, color: '#64748b', fontWeight: '600' }
});