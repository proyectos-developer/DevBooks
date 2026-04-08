import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    StatusBar, Dimensions, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bancosclientedata } from '../../redux/cliente/bancosclientedata.js';
import { bancosclienteConstants } from '../../uri/cliente/bancoscliente-constants.js';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function MisBancosScreen() {

    const dispatch = useDispatch()

    const [cuentas, setCuentas] = useState([]);
    const [loading, setLoading] = useState(true);

    const {get_listado_bancos} = useSelector(({bancoscliente_data}) => bancoscliente_data)

    useFocusEffect(
      useCallback(() => {
          fetchBancos();
      }, [])
    )
    const fetchBancos = () => {
      dispatch (bancosclientedata(bancosclienteConstants('0', {}, false).get_listado_bancos))
    };

    useEffect(() => {
      if (get_listado_bancos?.data){
        setCuentas(get_listado_bancos.data)
        setLoading(false)
      }
    }, [get_listado_bancos])

    const renderCard = ({ item }) => (
        <View style={styles.bankCard}>
            <View style={styles.cardTop}>
                <View>
                    <Text style={styles.bankLabel}>{item.banco}</Text>
                    <Text style={styles.accountNumber}>**** {item.numero_cuenta?.slice(-4)}</Text>
                </View>
                <Ionicons name="card" size={30} color="rgba(255,255,255,0.3)" />
            </View>
            <View style={styles.cardBottom}>
                <Text style={styles.balanceLabel}>Saldo Disponible</Text>
                <Text style={styles.balanceValue}>
                    {item.moneda} {parseFloat(item.saldo_actual).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO FIJO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Mis Bancos</Text>
                    <Text style={styles.headerSub}>Control de liquidez</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 250 }} />
            ) : (
                <FlatList 
                    data={cuentas}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCard}
                    contentContainerStyle={styles.scrollList}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={<Text style={styles.listTitle}>Cuentas Vinculadas</Text>}
                    ListEmptyComponent={<Text style={styles.empty}>No se encontraron cuentas configuradas.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerContainer: { height: 170, position: 'absolute', top: 0, width: '100%', zIndex: 10 },
    headerBg: { 
        position: 'absolute', width: width, height: 170, 
        backgroundColor: '#0f172a', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 
    },
    headerContent: { paddingHorizontal: 25, paddingTop: 60 },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
    headerSub: { color: '#10b981', fontSize: 13, fontWeight: '600' },
    
    // Márgenes de seguridad: Evita que el Header tape arriba y el Tab tape abajo
    scrollList: { paddingHorizontal: 25, paddingTop: 185, paddingBottom: 140 },
    
    listTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 20 },
    bankCard: { 
        backgroundColor: '#1e293b', borderRadius: 30, padding: 25, marginBottom: 20, 
        elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    bankLabel: { color: '#10b981', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
    accountNumber: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 5 },
    cardBottom: { marginTop: 30 },
    balanceLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' },
    balanceValue: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 5 },
    empty: { textAlign: 'center', marginTop: 100, color: '#94a3b8' }
});