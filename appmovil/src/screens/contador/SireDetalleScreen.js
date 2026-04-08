import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    StatusBar, Dimensions, ActivityIndicator, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

// Redux
import { sirecontadordata } from '../../redux/contador/sirecontadordata.js';
import { sirecontadorConstants } from '../../uri/contador/sirecontador-constants';

const { width } = Dimensions.get('window');

export default function SireDetalleScreen({ route, navigation }) {
    const { docId, tipo } = route.params;
    const dispatch = useDispatch();
  
    const [loading, setLoading] = useState(true);
    const [detalle, setDetalle] = useState(null);

    const { get_detalle_sire } = useSelector(({ sirecontador_data }) => sirecontador_data);

    useFocusEffect(
      useCallback(() => {
          setLoading(true);
          fetchDetalle();
      }, [docId, tipo])
    );

    const fetchDetalle = () => {
        dispatch(sirecontadordata(sirecontadorConstants(`${tipo}/${docId}`, {}, false).get_detalle_sire));
    };

    useEffect(() => {
        if (get_detalle_sire?.data) {
            setDetalle(get_detalle_sire.data);
            setLoading(false);
        }
    }, [get_detalle_sire]);

    if (loading) return (
        <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loaderText}>Comparando con SUNAT...</Text>
        </View>
    );

    if (!detalle) return null;

    const { sire, contabilidad_local } = detalle;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO FIJO (Mantiene posición arriba siempre) --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <View style={styles.topRow}>
                        <TouchableOpacity 
                            onPress={() => navigation.goBack()} 
                            style={styles.backBtn}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.titleArea}>
                            <Text style={styles.headerTitle}>Validación SIRE</Text>
                            <Text style={styles.headerSub}>Propuesta vs Contabilidad</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* --- CONTENIDO CON SCROLL (Padding estratégico para evitar solapamientos) --- */}
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {/* SECCIÓN SUNAT */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.iconDot, { backgroundColor: '#d1fae5' }]}>
                            <Ionicons name="cloud-done" size={20} color="#10b981" />
                        </View>
                        <Text style={styles.sectionTitle}>Propuesta SUNAT</Text>
                    </View>

                    <View style={styles.mainInfoCard}>
                        <Text style={styles.label}>Razón Social</Text>
                        <Text style={styles.mainValue}>{sire.razon_social_cliente || sire.razon_social_proveedor}</Text>
                        
                        <View style={styles.grid}>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>Comprobante</Text>
                                <Text style={styles.subValue}>{sire.serie}-{sire.numero}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.label}>Emisión</Text>
                                <Text style={styles.subValue}>{new Date(sire.fecha_emision).toLocaleDateString()}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total SUNAT</Text>
                            <Text style={styles.totalAmount}>S/ {parseFloat(sire.monto_total).toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* SECCIÓN LOCAL */}
                <View style={[styles.section, !contabilidad_local && styles.sectionMissing]}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.iconDot, { backgroundColor: contabilidad_local ? '#d1fae5' : '#fee2e2' }]}>
                            <Ionicons 
                                name={contabilidad_local ? "shield-checkmark" : "warning"} 
                                size={20} 
                                color={contabilidad_local ? "#10b981" : "#ef4444"} 
                            />
                        </View>
                        <Text style={styles.sectionTitle}>Contabilidad Local (DevBooks)</Text>
                    </View>

                    {contabilidad_local ? (
                        <View style={styles.localDataCard}>
                            <View style={styles.dataRow}>
                                <Text style={styles.label}>Glosa del Asiento</Text>
                                <Text style={styles.subValue}>{contabilidad_local.glosa}</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                                <Text style={styles.statusText}>VINCULADO CORRECTAMENTE</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.missingContainer}>
                            <Text style={styles.missingText}>
                                El comprobante electrónico no ha sido provisionado en tus libros.
                            </Text>
                            <TouchableOpacity style={styles.btnProvision} activeOpacity={0.8}>
                                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                                <Text style={styles.btnProvisionText}>Provisionar ahora</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Pie de página (Safe Area) */}
                <View style={styles.infoFooter}>
                    <Ionicons name="lock-closed-outline" size={14} color="#94a3b8" />
                    <Text style={styles.infoFooterText}>Validación procesada vía API SIRE-SUNAT</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 12, color: '#64748b', fontWeight: '600' },

    /* Header Pro Fijo */
    headerContainer: { 
        height: 170, 
        position: 'absolute', 
        top: 0, 
        width: '100%', 
        zIndex: 10 
    },
    headerBg: { 
        position: 'absolute', 
        width: width, 
        height: 170, 
        backgroundColor: '#0f172a', 
        borderBottomLeftRadius: 40, 
        borderBottomRightRadius: 40 
    },
    headerContent: { paddingHorizontal: 25, paddingTop: 55 },
    topRow: { flexDirection: 'row', alignItems: 'center' },
    backBtn: { 
        width: 45, 
        height: 45, 
        borderRadius: 15, 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 15 
    },
    titleArea: { flex: 1 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
    headerSub: { color: '#10b981', fontSize: 13, fontWeight: '600' },

    /* Scroll Content - Ajuste de márgenes para Header y Bottom Tab */
    scrollContent: { 
        paddingHorizontal: 20, 
        paddingTop: 180, // Evita que el header tape el primer card
        paddingBottom: 140 // Evita que el Bottom Tab tape el botón final
    },

    /* Secciones y Cards */
    section: { marginBottom: 25 },
    sectionMissing: { 
        borderWidth: 1.5, 
        borderColor: '#ef4444', 
        borderStyle: 'dashed', 
        borderRadius: 30,
        padding: 4
    },
    sectionHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 15,
        paddingLeft: 5
    },
    iconDot: { 
        width: 36, 
        height: 36, 
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 12 
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },

    mainInfoCard: { 
        backgroundColor: '#fff', 
        borderRadius: 28, 
        padding: 20, 
        elevation: 4, 
        shadowColor: '#000', 
        shadowOpacity: 0.05, 
        shadowRadius: 10 
    },
    label: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    mainValue: { color: '#1e293b', fontSize: 16, fontWeight: '800', marginTop: 4, marginBottom: 15 },
    grid: { flexDirection: 'row', justifyContent: 'space-between' },
    gridItem: { flex: 1 },
    subValue: { color: '#1e293b', fontSize: 14, fontWeight: '700', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 15, fontWeight: '800', color: '#64748b' },
    totalAmount: { fontSize: 22, fontWeight: '900', color: '#10b981' },

    localDataCard: { backgroundColor: '#fff', borderRadius: 28, padding: 20 },
    statusBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#f0fdf4', 
        paddingHorizontal: 12, 
        paddingVertical: 8, 
        borderRadius: 12, 
        marginTop: 15,
        alignSelf: 'flex-start'
    },
    statusText: { color: '#166534', fontSize: 11, fontWeight: '800', marginLeft: 6 },

    missingContainer: { padding: 15, alignItems: 'center' },
    missingText: { textAlign: 'center', color: '#64748b', fontSize: 13, marginBottom: 15, lineHeight: 20 },
    btnProvision: { 
        backgroundColor: '#0f172a', 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 14, 
        borderRadius: 18,
        elevation: 4
    },
    btnProvisionText: { color: '#fff', fontWeight: '800', marginLeft: 10 },

    infoFooter: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 10,
        marginBottom: 20
    },
    infoFooterText: { color: '#94a3b8', fontSize: 11, marginLeft: 6, fontWeight: '500' }
});