import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function TipoCambioScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [tc, setTc] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            setTc({ compra: 3.725, venta: 3.732, fecha: '07 de Abril, 2026' });
            setLoading(false);
        }, 1500);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* Header Pro */}
            <View style={styles.header}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Tipo de Cambio</Text>
                    <Text style={styles.headerSub}>Fuente: SBS / SUNAT</Text>
                </View>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#10b981" />
                ) : (
                    <>
                        <View style={styles.dateCard}>
                            <Ionicons name="calendar-outline" size={20} color="#64748b" />
                            <Text style={styles.dateText}>{tc.fecha}</Text>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.tcCard}>
                                <Text style={styles.tcLabel}>COMPRA</Text>
                                <Text style={styles.tcValue}>{tc.compra.toFixed(3)}</Text>
                            </View>
                            <View style={styles.tcCard}>
                                <Text style={[styles.tcLabel, {color: '#ef4444'}]}>VENTA</Text>
                                <Text style={styles.tcValue}>{tc.venta.toFixed(3)}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.refreshBtn} onPress={() => setLoading(true)}>
                            <Ionicons name="refresh" size={20} color="#fff" />
                            <Text style={styles.refreshText}>Actualizar</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { height: 180 },
    headerBg: { position: 'absolute', top: 0, width: width, height: 180, backgroundColor: '#0f172a', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerContent: { paddingHorizontal: 25, paddingTop: 60 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
    headerSub: { color: '#10b981', fontSize: 13, fontWeight: '600' },
    content: { flex: 1, marginTop: -30, paddingHorizontal: 25, alignItems: 'center' },
    dateCard: { backgroundColor: '#fff', flexDirection: 'row', padding: 15, borderRadius: 20, alignItems: 'center', marginBottom: 20, elevation: 2 },
    dateText: { marginLeft: 10, color: '#1e293b', fontWeight: '700' },
    row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    tcCard: { backgroundColor: '#fff', width: '48%', padding: 25, borderRadius: 25, alignItems: 'center', elevation: 4 },
    tcLabel: { fontSize: 12, fontWeight: '800', color: '#10b981', marginBottom: 10 },
    tcValue: { fontSize: 32, fontWeight: '900', color: '#0f172a' },
    refreshBtn: { backgroundColor: '#0f172a', flexDirection: 'row', padding: 18, borderRadius: 20, marginTop: 30, width: '100%', justifyContent: 'center', alignItems: 'center' },
    refreshText: { color: '#fff', fontWeight: '800', marginLeft: 10 }
});