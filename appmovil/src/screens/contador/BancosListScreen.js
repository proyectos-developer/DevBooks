import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {bancoscontadordata} from '../../redux/contador/bancoscontadordata.js'
import {bancoscontadorConstants} from '../../uri/contador/bancoscontador-constants.js'
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

export default function BancosListScreen({ navigation }) {

    const dispatch = useDispatch()

    const [cuentas, setCuentas] = useState([]);
    const [loading, setLoading] = useState(true);

    const {get_bancos} = useSelector(({bancoscontador_data}) => bancoscontador_data)

    useFocusEffect(
      useCallback(() => {
        fetchCuentas()
      }, [dispatch])
    )

    const fetchCuentas = () => {
      dispatch (bancoscontadordata(bancoscontadorConstants('0', {}, false).get_bancos))
    };

    useEffect(() => {
      if (get_bancos?.data){
        setCuentas(get_bancos.data)
        setLoading(false)
      }
    }, [get_bancos])

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Conciliacion', { cuentaId: item.id, banco: item.banco })}
        >
            <View style={styles.bankIcon}>
                <Ionicons name="card-outline" size={24} color="#10b981" />
            </View>
            <View style={styles.info}>
                <Text style={styles.bankName}>{item.banco}</Text>
                <Text style={styles.accNumber}>{item.numero_cuenta}</Text>
                <Text style={styles.pcge}>Contable: {item.cuenta_contable}</Text>
            </View>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.pendientes} pendientes</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerPro}>
                <Text style={styles.title}>Bancos y Tesorería</Text>
                <Text style={styles.sub}>Gestiona tus cuentas y conciliaciones</Text>
            </View>
            {loading ? <ActivityIndicator size="large" color="#10b981" /> : (
                <FlatList 
                    data={cuentas}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerPro: { backgroundColor: '#0f172a', padding: 25, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    title: { color: '#fff', fontSize: 22, fontWeight: '800' },
    sub: { color: '#10b981', fontSize: 13, marginTop: 5 },
    list: { padding: 20 },
    card: { flexDirection: 'row', backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 15, alignItems: 'center', elevation: 3 },
    bankIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    info: { flex: 1 },
    bankName: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    accNumber: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
    pcge: { fontSize: 11, color: '#10b981', fontWeight: '700', marginTop: 4 },
    badge: { backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    badgeText: { color: '#ef4444', fontSize: 10, fontWeight: '900' }
});