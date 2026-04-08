import React, { useCallback, useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    StatusBar, Dimensions, ActivityIndicator, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

// Redux
import { resumenesclientedata } from '../../redux/cliente/resumenesclientedata.js';
import { resumenesclienteConstants } from '../../uri/cliente/resumenescliente-constants.js';

const { width } = Dimensions.get('window');

export default function ClienteDashboard({ navigation }) {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const { get_resumenes } = useSelector(({ resumenescliente_data }) => resumenescliente_data);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = () => {
        setLoading(true);
        const mes = new Date().getMonth() + 1;
        const anio = new Date().getFullYear();
        dispatch(resumenesclientedata(resumenesclienteConstants(mes, anio).get_resumenes));
    };

    useEffect(() => {
        if (get_resumenes?.data) {
            setData(get_resumenes.data);
            setLoading(false);
        }
    }, [get_resumenes]);

    if (loading) return (
        <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loaderText}>Preparando resumen financiero...</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO FIJO CON ZINDEX ALTO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        <View style={{flex: 1}}>
                            <Text style={styles.welcome}>Panel de Control</Text>
                            <Text style={styles.businessName} numberOfLines={1}>
                                {data?.empresa_nombre || 'Mi Empresa'}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.notifBtn}
                            onPress={() => navigation.navigate('Notificaciones')}
                        >
                            <Ionicons name="notifications-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView 
                // CRÍTICO: paddingTop para el Header y paddingBottom para el Bottom Tab
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {/* --- MÉTRICAS SIRE --- */}
                <View style={styles.statsRow}>
                    <StatCard 
                        title="Ventas del Mes" 
                        amount={`S/ ${parseFloat(data?.metricas?.total_ventas || 0).toLocaleString()}`} 
                        icon="trending-up" 
                        color="#10b981" 
                        sub="Declarado SUNAT"
                    />
                    <StatCard 
                        title="Gastos / Compras" 
                        amount={`S/ ${parseFloat(data?.metricas?.total_compras || 0).toLocaleString()}`} 
                        icon="trending-down" 
                        color="#ef4444" 
                        sub="Propuesta SUNAT"
                    />
                </View>

                {/* --- DISPONIBILIDAD BANCARIA --- */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Saldos en Bancos</Text>
                        <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                    </View>
                    <View style={styles.bankCard}>
                        {data?.bancos?.map((bank, index) => (
                            <View key={index}>
                                <BankItem 
                                    banco={bank.banco} 
                                    moneda={bank.moneda} 
                                    saldo={parseFloat(bank.saldo_actual || 0).toLocaleString()} 
                                />
                                {index < data.bancos.length - 1 && <View style={styles.divider} />}
                            </View>
                        ))}
                    </View>
                </View>

                {/* --- TOP CLIENTES --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Clientes Principales</Text>
                    <View style={styles.topListCard}>
                        {data?.topClientes?.map((cli, index) => (
                            <View key={index} style={styles.topItem}>
                                <View style={styles.rankCircle}>
                                    <Text style={styles.rankText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.cliName} numberOfLines={1}>{cli.nombre_razon_social}</Text>
                                <Text style={styles.cliAmount}>S/ {parseFloat(cli.total_comprado).toLocaleString()}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* --- PIE DE PÁGINA / ESPACIADO FINAL --- */}
                <View style={styles.footerInfo}>
                    <Ionicons name="shield-checkmark-outline" size={14} color="#cbd5e1" />
                    <Text style={styles.footerText}> Datos protegidos por DevBooks v1.0.4</Text>
                </View>
            </ScrollView>
        </View>
    );
}

// Sub-componentes
const StatCard = ({ title, amount, icon, color, sub }) => (
    <View style={styles.statCard}>
        <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.statLabel}>{title}</Text>
        <Text style={styles.statAmount}>{amount}</Text>
        <Text style={styles.statSub}>{sub}</Text>
    </View>
);

const BankItem = ({ banco, moneda, saldo }) => (
    <View style={styles.bankItem}>
        <View style={styles.bankInfo}>
            <Ionicons name="card-outline" size={18} color="#64748b" />
            <Text style={styles.bankName}>{banco}</Text>
        </View>
        <Text style={styles.bankValue}>{moneda} {saldo}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 10, color: '#64748b', fontWeight: '600' },
    
    /* Header Pro Fijo */
    headerContainer: { 
        height: 180, 
        position: 'absolute', 
        top: 0, 
        width: '100%', 
        zIndex: 100 // Garantiza que esté por encima de todo
    },
    headerBg: { 
        position: 'absolute', 
        width: width, 
        height: 180, 
        backgroundColor: '#0f172a', 
        borderBottomLeftRadius: 40, 
        borderBottomRightRadius: 40 
    },
    headerContent: { paddingHorizontal: 25, paddingTop: 60 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    welcome: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    businessName: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 },
    notifBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    
    /* Scroll Content - AJUSTES CLAVE */
    scrollContent: { 
        paddingHorizontal: 20, 
        paddingTop: 190, // Suficiente espacio para el Header curvo
        paddingBottom: 130 // Suficiente espacio para el Bottom Tab flotante
    },
    
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    statCard: { backgroundColor: '#fff', width: (width - 55) / 2, borderRadius: 28, padding: 20, elevation: 5, shadowColor: '#0f172a', shadowOpacity: 0.05, shadowRadius: 10 },
    iconCircle: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    statLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    statAmount: { color: '#1e293b', fontSize: 17, fontWeight: '900', marginTop: 5 },
    statSub: { color: '#10b981', fontSize: 10, fontWeight: '700', marginTop: 5 },

    section: { marginBottom: 25 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
    sectionTitle: { fontSize: 16, fontWeight: '900', color: '#1e293b' },
    
    bankCard: { backgroundColor: '#fff', borderRadius: 28, padding: 20, elevation: 3 },
    bankItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    bankInfo: { flexDirection: 'row', alignItems: 'center' },
    bankName: { color: '#1e293b', fontWeight: '800', marginLeft: 10, fontSize: 15 },
    bankValue: { color: '#10b981', fontWeight: '900', fontSize: 15 },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },

    topListCard: { backgroundColor: '#fff', borderRadius: 28, padding: 20, elevation: 3 },
    topItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    rankCircle: { width: 28, height: 28, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    rankText: { fontSize: 12, fontWeight: '900', color: '#0f172a' },
    cliName: { flex: 1, fontSize: 14, fontWeight: '700', color: '#475569' },
    cliAmount: { fontSize: 14, fontWeight: '900', color: '#0f172a' },

    footerInfo: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    footerText: { fontSize: 11, color: '#cbd5e1', fontWeight: '700' }
});