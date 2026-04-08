import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TextInput, 
    ActivityIndicator, StatusBar, Dimensions, TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import { contableadmindata } from '../../redux/admin/contableadmindata.js';
import { contableadminConstants } from '../../uri/admin/contableadmin-constants.js';

const { width } = Dimensions.get('window');

export default function PlanContableList({ navigation }) {
    const dispatch = useDispatch();
  
    const [search, setSearch] = useState('');
    const [cuentas, setCuentas] = useState([]);
    const [loading, setLoading] = useState(true);

    const { get_listar_cuentas } = useSelector(({ contableadmin_data }) => contableadmin_data);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [dispatch])
    );

    const loadData = () => {
        dispatch(contableadmindata(contableadminConstants('0', {}, false).get_listar_cuentas));
    };

    useEffect(() => {
        if(get_listar_cuentas?.data){
            setCuentas(get_listar_cuentas.data);
            setLoading(false);
        }
    }, [get_listar_cuentas]);

    const filteredData = cuentas?.length > 0 && cuentas?.filter(item => 
        item.codigo?.includes(search) || 
        item.descripcion?.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <View style={[
            styles.itemCard, 
            item.nivel > 1 && { marginLeft: (item.nivel - 1) * 15 }, // Indentación dinámica por nivel
            item.permite_movimiento === 0 && styles.headerAccount
        ]}>
            <View style={[
                styles.codeBadge, 
                { backgroundColor: item.permite_movimiento === 0 ? '#1e293b' : '#10b981' }
            ]}>
                <Text style={styles.codeText}>{item.codigo}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={[
                    styles.description,
                    item.permite_movimiento === 0 && styles.boldText
                ]} numberOfLines={2}>
                    {item.descripcion}
                </Text>
                <View style={styles.tagContainer}>
                    <Text style={styles.levelText}>Nivel {item.nivel}</Text>
                    {item.permite_movimiento === 0 ? (
                        <View style={styles.titleTag}><Text style={styles.tagText}>TÍTULO</Text></View>
                    ) : (
                        <View style={styles.entryTag}><Text style={styles.tagText}>REGISTRO</Text></View>
                    )}
                </View>
            </View>
            {item.permite_movimiento === 1 && (
                <Ionicons name="layers-outline" size={18} color="#10b981" />
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Plan Contable (PCGE)</Text>
                    </View>
                    
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#94a3b8" />
                        <TextInput 
                            style={styles.searchInput}
                            placeholder="Buscar código o descripción..."
                            placeholderTextColor="#94a3b8"
                            value={search}
                            onChangeText={setSearch}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <Ionicons name="close-circle" size={18} color="#cbd5e1" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#10b981" />
                    <Text style={styles.loadingText}>Cargando catálogo...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredData || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <Text style={styles.resultsText}>
                            {filteredData?.length || 0} cuentas disponibles
                        </Text>
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="file-tray-outline" size={60} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No se encontraron resultados para "{search}"</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#64748b', fontWeight: '600' },
    
    /* Header Pro */
    headerContainer: { height: 200, position: 'relative' },
    headerBg: { 
        position: 'absolute', top: 0, width: width, height: 200, 
        backgroundColor: '#0f172a', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 
    },
    headerContent: { paddingHorizontal: 25, paddingTop: 55 },
    headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
    searchBar: { 
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
        paddingHorizontal: 15, borderRadius: 18, height: 55, 
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 8 
    },
    searchInput: { flex: 1, marginLeft: 12, color: '#1e293b', fontSize: 15, fontWeight: '500' },

    /* List Content */
    listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
    resultsText: { color: '#94a3b8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
    
    itemCard: { 
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
        padding: 16, borderRadius: 20, marginBottom: 12, borderLeftWidth: 0,
        shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 
    },
    headerAccount: { backgroundColor: '#f1f5f9', borderLeftWidth: 4, borderLeftColor: '#0f172a' },
    codeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginRight: 15 },
    codeText: { color: '#fff', fontSize: 13, fontWeight: '900' },
    infoContainer: { flex: 1 },
    description: { fontSize: 14, color: '#475569', fontWeight: '500', lineHeight: 20 },
    boldText: { fontWeight: '800', color: '#0f172a' },
    
    tagContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    levelText: { fontSize: 11, color: '#94a3b8', fontWeight: '700', marginRight: 10 },
    titleTag: { backgroundColor: '#e2e8f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    entryTag: { backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    tagText: { fontSize: 9, fontWeight: '900', color: '#64748b' },

    empty: { marginTop: 80, alignItems: 'center' },
    emptyText: { color: '#94a3b8', fontWeight: '600', marginTop: 15, textAlign: 'center' }
});