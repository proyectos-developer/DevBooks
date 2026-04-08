import React, { useCallback, useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    StatusBar, Dimensions, ActivityIndicator, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { resumenescontadordata } from '../../redux/contador/resumenescontadordata.js';
import { resumenescontadorConstants } from '../../uri/contador/resumenescontador-constants.js';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function ContadorDashboard({ navigation }) {
    const dispatch = useDispatch();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    const { get_resumenes } = useSelector(({ resumenescontador_data }) => resumenescontador_data);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [dispatch])
    );

    const loadData = () => {
        dispatch(resumenescontadordata(resumenescontadorConstants('0', {}, false).get_resumenes));
    };

    useEffect(() => {
        if (get_resumenes?.data) {
            setStats(get_resumenes.data);
            setLoading(false);
        }
    }, [get_resumenes]);

    if (loading) return (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loaderText}>Consolidando datos contables...</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO FIJO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <View style={styles.topBar}>
                        <View>
                            <Text style={styles.welcomeText}>Hola, {user?.nombre || 'Contador'}</Text>
                            <View style={styles.brandContainer}>
                                <Text style={styles.brandTitle}>Dev<Text style={styles.bold}>Books</Text></Text>
                                <View style={styles.proBadge}><Text style={styles.proText}>PRO</Text></View>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.notifButton}>
                            <Ionicons name="notifications-outline" size={24} color="#fff" />
                            <View style={styles.notifDot} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.dateContainer}>
                        <Ionicons name="calendar-outline" size={14} color="#10b981" />
                        <Text style={styles.dateText}>
                            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </Text>
                    </View>
                </View>
            </View>

            {/* --- CONTENIDO CON SCROLL --- */}
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                {/* Metricas Principales (Ahora con margen para no ser tapadas) */}
                <View style={styles.kpiRow}>
                    <TouchableOpacity 
                        style={[styles.kpiCard, { backgroundColor: '#1e293b' }]}
                        onPress={() => navigation.navigate('Bancos')}
                    >
                        <View style={styles.kpiIconHeader}>
                            <Ionicons name="swap-horizontal" size={20} color="#10b981" />
                        </View>
                        <Text style={styles.kpiLabelDark}>Por Conciliar</Text>
                        <Text style={styles.kpiValueWhite}>{stats?.bancosPendientes} <Text style={styles.unit}>Movs.</Text></Text>
                        <Text style={styles.kpiAmount}>S/ {stats?.bancosMonto?.toLocaleString()}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.kpiCard}
                        onPress={() => navigation.navigate('SIRE')}
                    >
                        <View style={[styles.kpiIconHeader, { backgroundColor: '#fee2e2' }]}>
                            <Ionicons name="cloud-warning" size={20} color="#ef4444" />
                        </View>
                        <Text style={styles.kpiLabelLight}>Alertas SIRE</Text>
                        <Text style={styles.kpiValueDark}>{stats?.sirePendiente} <Text style={styles.unit}>Docs</Text></Text>
                        <Text style={styles.kpiStatus}>Revisión pendiente</Text>
                    </TouchableOpacity>
                </View>

                {/* Accesos Directos */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Operaciones Diarias</Text>
                    <TouchableOpacity><Text style={styles.seeAll}>Ver historial</Text></TouchableOpacity>
                </View>
                
                <View style={styles.menuGrid}>
                    <MenuButton 
                        title="Libro Diario" 
                        icon="receipt-outline" 
                        onPress={() => navigation.navigate('Diario')}
                        desc={`${stats?.asientosMes} asientos registrados`}
                    />
                    <MenuButton 
                        title="Tipo de Cambio" 
                        icon="trending-up-outline" 
                        onPress={() => navigation.navigate ('TipoCambio')} 
                        desc="Referencial SUNAT / SBS"
                    />
                    <MenuButton 
                        title="Entidades" 
                        icon="business-outline" 
                        onPress={() => navigation.navigate ('Entidades')} 
                        desc="Gestión de Clientes/Proveedores"
                    />
                </View>

                {/* Estado del Periodo */}
                <View style={styles.periodCard}>
                    <View style={styles.periodIcon}>
                        <Ionicons name="time-outline" size={24} color="#10b981" />
                    </View>
                    <View style={styles.periodInfo}>
                        <Text style={styles.periodLabel}>Periodo Fiscal en curso</Text>
                        <Text style={styles.periodValue}>Abril 2026</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <View style={styles.activeDot} />
                        <Text style={styles.statusText}>ABIERTO</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const MenuButton = ({ title, icon, onPress, desc }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIconBg}>
            <Ionicons name={icon} size={24} color="#10b981" />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>{title}</Text>
            <Text style={styles.menuDesc}>{desc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 12, color: '#64748b', fontWeight: '600' },
    
    /* Header Styles - Fijo al tope */
    headerContainer: { 
        height: 210, 
        width: '100%',
        position: 'absolute', // Mantiene el header arriba
        top: 0,
        zIndex: 10
    },
    headerBg: { 
        position: 'absolute', top: 0, width: width, height: 210, 
        backgroundColor: '#0f172a', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 
    },
    headerContent: { paddingHorizontal: 25, paddingTop: 60 },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    welcomeText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
    brandContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    brandTitle: { color: '#fff', fontSize: 24, fontWeight: '300' },
    bold: { fontWeight: '900' },
    proBadge: { 
        backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 8, 
        paddingVertical: 2, borderRadius: 6, marginLeft: 10 
    },
    proText: { color: '#10b981', fontSize: 10, fontWeight: '900' },
    notifButton: { 
        width: 45, height: 45, borderRadius: 15, 
        backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' 
    },
    notifDot: { 
        position: 'absolute', top: 12, right: 12, width: 8, 
        height: 8, borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 1.5, borderColor: '#0f172a' 
    },
    dateContainer: { 
        flexDirection: 'row', alignItems: 'center', marginTop: 20, 
        backgroundColor: 'rgba(16, 185, 129, 0.1)', alignSelf: 'flex-start', 
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 
    },
    dateText: { color: '#10b981', fontSize: 12, fontWeight: '800', marginLeft: 6, textTransform: 'capitalize' },

    /* Scroll Content - Padding estratégico */
    scrollContent: { 
        paddingHorizontal: 20, 
        paddingTop: 180, // Empuja las métricas hacia abajo para que el header no las tape
        paddingBottom: 120 // Espacio extra para que el Bottom Tab no tape el último elemento
    },
    
    kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    kpiCard: { 
        width: '48%', backgroundColor: '#fff', padding: 20, borderRadius: 28, 
        elevation: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 
    },
    kpiIconHeader: { 
        width: 36, height: 36, borderRadius: 12, 
        backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 
    },
    kpiLabelDark: { color: '#94a3b8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
    kpiLabelLight: { color: '#64748b', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
    kpiValueWhite: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 4 },
    kpiValueDark: { color: '#1e293b', fontSize: 20, fontWeight: '800', marginTop: 4 },
    unit: { fontSize: 12, fontWeight: '400', color: '#94a3b8' },
    kpiAmount: { color: '#10b981', fontSize: 15, fontWeight: '700', marginTop: 2 },
    kpiStatus: { color: '#94a3b8', fontSize: 11, marginTop: 4 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    seeAll: { color: '#10b981', fontWeight: '700', fontSize: 13 },
    menuGrid: { gap: 12 },
    menuItem: { 
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
        padding: 16, borderRadius: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 
    },
    menuIconBg: { 
        width: 48, height: 48, borderRadius: 16, backgroundColor: '#f0fdf4', 
        justifyContent: 'center', alignItems: 'center', marginRight: 15 
    },
    menuTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    menuDesc: { fontSize: 12, color: '#94a3b8', marginTop: 2 },

    periodCard: { 
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
        padding: 20, borderRadius: 28, marginTop: 20, borderWidth: 1, borderColor: '#f1f5f9' 
    },
    periodIcon: { 
        width: 45, height: 45, borderRadius: 14, backgroundColor: '#f0fdf4', 
        justifyContent: 'center', alignItems: 'center', marginRight: 15 
    },
    periodInfo: { flex: 1 },
    periodLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
    periodValue: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
    statusBadge: { 
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', 
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 
    },
    activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginRight: 6 },
    statusText: { color: '#166534', fontSize: 10, fontWeight: '900' }
});