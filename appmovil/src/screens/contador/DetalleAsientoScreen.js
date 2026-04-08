import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../redux/axios_auth';
import { resumenescontadordata } from '../../redux/contador/resumenescontadordata';
import { resumenescontadorConstants } from '../../uri/contador/resumenescontador-constants';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

export default function DetalleAsientoScreen({ route }) {

    const { asientoId } = route.params;

    const dispatch = useDispatch()

    const [loading, setLoading] = useState(true);
    const [asiento, setAsiento] = useState(null);

    const {get_detalle_asiento} = useSelector(({resumenescontador_data}) => resumenescontador_data)

    useFocusEffect(
      useCallback(() => {
          fetchDetalle();
      }, [asientoId])
    )

    const fetchDetalle = () => {
      dispatch (resumenescontadordata(resumenescontadorConstants(asientoId, {}, false).get_detalle_asiento))
    };

    useEffect(() => {
      if (get_detalle_asiento?.data){
        setAsiento (get_detalle_asiento.data)
        setLoading(false)
      }
    }, [get_detalle_asiento])

    if (loading) return <ActivityIndicator size="large" color="#10b981" style={{ flex: 1 }} />;

    const { cabecera, movimientos } = asiento;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header Pro */}
            <View style={styles.header}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Voucher Contable</Text>
                    <Text style={styles.headerSub}>{cabecera.glosa}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Card de Información General (Tabla 8) */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Fecha:</Text>
                        <Text style={styles.value}>{new Date(cabecera.fecha_asiento).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Periodo:</Text>
                        <Text style={styles.value}>{cabecera.mes}-{cabecera.anio}</Text>
                    </View>
                </View>

                {/* Tabla de Movimientos (Tabla 9) */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.col, { flex: 2 }]}>Cuenta</Text>
                        <Text style={[styles.col, { flex: 1, textAlign: 'right' }]}>Debe</Text>
                        <Text style={[styles.col, { flex: 1, textAlign: 'right' }]}>Haber</Text>
                    </View>

                    {movimientos.map((mov, index) => (
                        <View key={index} style={styles.tableRow}>
                            <View style={{ flex: 2 }}>
                                <Text style={styles.accCode}>{mov.cuenta_codigo}</Text>
                                <Text style={styles.accName} numberOfLines={1}>{mov.cuenta_nombre}</Text>
                                {mov.entidad_nombre && <Text style={styles.entidad}>Ref: {mov.entidad_nombre}</Text>}
                            </View>
                            <Text style={[styles.amount, { flex: 1 }]}>{mov.debe > 0 ? mov.debe : '-'}</Text>
                            <Text style={[styles.amount, { flex: 1 }]}>{mov.haber > 0 ? mov.haber : '-'}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { height: 160 },
    headerBg: { position: 'absolute', top: 0, width: '100%', height: 160, backgroundColor: '#0f172a', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerContent: { padding: 25, paddingTop: 60 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
    headerSub: { color: '#10b981', fontSize: 14, marginTop: 5 },
    scroll: { padding: 20 },
    infoCard: { backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 20, elevation: 2 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    label: { color: '#94a3b8', fontWeight: '600' },
    value: { color: '#1e293b', fontWeight: '700' },
    table: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 2 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 12 },
    col: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
    tableRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
    accCode: { fontWeight: 'bold', color: '#10b981' },
    accName: { fontSize: 11, color: '#64748b' },
    entidad: { fontSize: 10, color: '#94a3b8', fontStyle: 'italic' },
    amount: { textAlign: 'right', fontWeight: '600', color: '#1e293b' }
});