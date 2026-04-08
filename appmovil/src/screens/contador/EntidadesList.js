import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TextInput, 
    TouchableOpacity, ActivityIndicator, Dimensions, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

// Redux
import { entidadescontadordata } from '../../redux/contador/entidadescontadordata';
import { entidadescontadorConstants } from '../../uri/contador/entidadescontador-constants';

const { width } = Dimensions.get('window');

export default function EntidadesList({ navigation }) {
    const dispatch = useDispatch();

    const [entidades, setEntidades] = useState([])
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const { get_entidades } = useSelector(({ entidadescontador_data }) => entidadescontador_data);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [dispatch])
    );

    const loadData = () => {
        dispatch(entidadescontadordata(entidadescontadorConstants('0', {}, false).get_entidades));
    };

    useEffect(() => {
        if (get_entidades?.data) {
            setEntidades(get_entidades.data)
            setLoading(false);
        }
    }, [get_entidades]);

    // Filtrado en tiempo real
    const filteredEntidades = entidades?.length > 0 && entidades.filter(item => 
        item.nombre_razon_social?.toLowerCase().includes(search.toLowerCase()) ||
        item.numero_documento?.includes(search)
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.7}
            onPress={() => navigation.navigate ('DetallesEntidad', {entidadId: item.id})}>
            <View style={styles.iconContainer}>
                <Ionicons name="business" size={22} color="#10b981" />
            </View>
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.nombre_razon_social}</Text>
                <View style={styles.documentBadge}>
                    <Text style={styles.rucLabel}>{item.tipo_documento}:</Text>
                    <Text style={styles.rucNumber}>{item.numero_documento}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO FIJO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <View style={styles.topRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Entidades</Text>
                    </View>
                    
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#94a3b8" />
                        <TextInput 
                            style={styles.searchInput} 
                            placeholder="Buscar RUC o Razón Social..." 
                            placeholderTextColor="#94a3b8"
                            value={search}
                            onChangeText={setSearch}
                        />
                        {search !== '' && (
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
                    <Text style={styles.loadingText}>Cargando directorio...</Text>
                </View>
            ) : (
                <FlatList 
                    data={filteredEntidades || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listPadding}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <Text style={styles.listHeader}>
                            {filteredEntidades?.length || 0} Registros encontrados
                        </Text>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={60} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No coinciden resultados con la búsqueda</Text>
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
    headerContainer: { 
        height: 210, 
        position: 'absolute', 
        top: 0, 
        width: '100%', 
        zIndex: 10 
    },
    headerBg: { 
        position: 'absolute', 
        width: width, 
        height: 210, 
        backgroundColor: '#0f172a', 
        borderBottomLeftRadius: 40, 
        borderBottomRightRadius: 40 
    },
    headerContent: { paddingHorizontal: 25, paddingTop: 55 },
    topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backBtn: { 
        width: 40, 
        height: 40, 
        borderRadius: 12, 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 15 
    },
    title: { color: '#fff', fontSize: 22, fontWeight: '900' },
    
    searchBar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        paddingHorizontal: 15, 
        borderRadius: 18, 
        height: 55,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#1e293b', fontWeight: '500' },

    /* Listado */
    listPadding: { 
        paddingHorizontal: 20, 
        paddingTop: 225, // Espacio para el header fijo
        paddingBottom: 110 // Espacio para el Bottom Tab
    },
    listHeader: { 
        color: '#94a3b8', 
        fontSize: 12, 
        fontWeight: '700', 
        textTransform: 'uppercase', 
        marginBottom: 15, 
        letterSpacing: 1 
    },
    card: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        padding: 16, 
        borderRadius: 24, 
        marginBottom: 12, 
        elevation: 2,
        shadowColor: '#0f172a',
        shadowOpacity: 0.05,
        shadowRadius: 10
    },
    iconContainer: { 
        width: 48, 
        height: 48, 
        borderRadius: 16, 
        backgroundColor: '#f0fdf4', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 15 
    },
    info: { flex: 1 },
    name: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
    documentBadge: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
    rucLabel: { fontSize: 11, fontWeight: '700', color: '#10b981', marginRight: 5 },
    rucNumber: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
    actionBtn: { padding: 5 },

    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { marginTop: 15, color: '#94a3b8', fontWeight: '600', textAlign: 'center' }
});