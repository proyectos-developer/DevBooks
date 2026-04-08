import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    StatusBar, Dimensions, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import { entidadescontadordata } from '../../redux/contador/entidadescontadordata';
import { entidadescontadorConstants } from '../../uri/contador/entidadescontador-constants';

const { width } = Dimensions.get('window');

export default function DetalleEntidadScreen({ route, navigation }) {

    const dispatch = useDispatch();
    
    const { entidadId } = route.params;
    
    const [entidad, setEntidad] = useState(null);
    const [loading, setLoading] = useState(true);

    const { get_detalles_entidad } = useSelector(({ entidadescontador_data }) => entidadescontador_data);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchDetalle();
        }, [entidadId])
    );

    const fetchDetalle = () => {
        dispatch(entidadescontadordata(entidadescontadorConstants(entidadId, {}, false).get_detalles_entidad));
    };

    useEffect(() => {
        if (get_detalles_entidad?.data) {
            setEntidad(get_detalles_entidad.data);
            setLoading(false);
        }
    }, [get_detalles_entidad]);

    if (loading) return (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loaderText}>Cargando ficha técnica...</Text>
        </View>
    );

    if (!entidad) return null;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* --- HEADER PRO FIJO --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBg} />
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Ficha de Entidad</Text>
                        <Text style={styles.headerSub}>ID: {entidadId}</Text>
                    </View>
                </View>
            </View>

            {/* --- CONTENIDO DESPLAZABLE --- */}
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card Solapada */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarBg}>
                            <Ionicons name="business" size={35} color="#10b981" />
                        </View>
                    </View>
                    
                    <Text style={styles.mainName}>{entidad.nombre_razon_social}</Text>
                    
                    <View style={styles.badge}>
                        <Ionicons name="finger-print-outline" size={14} color="#166534" style={{marginRight: 5}} />
                        <Text style={styles.badgeText}>
                            {entidad.tipo_documento}: {entidad.numero_documento}
                        </Text>
                    </View>
                </View>

                {/* Sección de Datos */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="information-circle-outline" size={20} color="#0f172a" />
                        <Text style={styles.sectionTitle}>Información de contacto</Text>
                    </View>
                    
                    <View style={styles.infoBox}>
                        <InfoRow icon="mail-outline" label="Correo Electrónico" value={entidad.email || 'No registrado'} />
                        <View style={styles.divider} />
                        <InfoRow icon="call-outline" label="Teléfono / Celular" value={entidad.telefono || 'No registrado'} />
                        <View style={styles.divider} />
                        <InfoRow icon="location-outline" label="Domicilio Fiscal" value={entidad.direccion || 'No registrada'} />
                    </View>
                </View>

                {/* Botón de Acción */}
                <TouchableOpacity style={styles.historyBtn} activeOpacity={0.8}
                    onPress={() => navigation.navigate ('EntidadMovimientos', {entidadId: entidadId})}>
                    <View style={styles.historyBtnContent}>
                        <Ionicons name="list-circle-outline" size={24} color="#fff" />
                        <Text style={styles.historyBtnText}>Ver Historial de Movimientos</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>

                {/* Tip para el contador */}
                <View style={styles.tipBox}>
                    <Ionicons name="shield-checkmark-outline" size={16} color="#94a3b8" />
                    <Text style={styles.tipText}>
                        Datos sincronizados con la base de datos central de DevBooks.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
        <View style={styles.rowIconContainer}>
            <Ionicons name={icon} size={20} color="#10b981" />
        </View>
        <View style={{flex: 1}}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    loaderText: { marginTop: 12, color: '#64748b', fontWeight: '600' },
    
    /* Header Pro Fijo */
    headerContainer: { 
        height: 180, 
        position: 'absolute', 
        top: 0, 
        width: '100%', 
        zIndex: 10 
    },
    headerBg: { 
        position: 'absolute', 
        width: width, 
        height: 180, 
        backgroundColor: '#0f172a', 
        borderBottomLeftRadius: 40, 
        borderBottomRightRadius: 40 
    },
    headerContent: { 
        paddingHorizontal: 25, 
        paddingTop: 60, 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    backBtn: { 
        width: 45, 
        height: 45, 
        borderRadius: 15, 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 15 
    },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
    headerSub: { color: '#10b981', fontSize: 12, fontWeight: '700' },

    /* Scroll y Contenido */
    scrollContent: { 
        paddingHorizontal: 20, 
        paddingTop: 140, // Espacio para que el perfil se solape correctamente
        paddingBottom: 120 // Espacio para que no lo tape el Bottom Tab
    },

    /* Card de Perfil */
    profileCard: { 
        backgroundColor: '#fff', 
        borderRadius: 30, 
        padding: 25, 
        alignItems: 'center', 
        elevation: 10, 
        shadowColor: '#0f172a', 
        shadowOpacity: 0.1, 
        shadowRadius: 15 
    },
    avatarContainer: { 
        marginTop: -10,
        marginBottom: 15 
    },
    avatarBg: { 
        width: 75, 
        height: 75, 
        borderRadius: 22, 
        backgroundColor: '#f0fdf4', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    mainName: { 
        fontSize: 18, 
        fontWeight: '900', 
        color: '#1e293b', 
        textAlign: 'center',
        lineHeight: 24
    },
    badge: { 
        flexDirection: 'row',
        backgroundColor: '#dcfce7', 
        paddingHorizontal: 16, 
        paddingVertical: 8, 
        borderRadius: 12, 
        marginTop: 15,
        alignItems: 'center'
    },
    badgeText: { color: '#166534', fontSize: 13, fontWeight: '800' },

    /* Secciones de Datos */
    section: { marginTop: 25 },
    sectionHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 15, 
        paddingLeft: 5 
    },
    sectionTitle: { 
        fontSize: 16, 
        fontWeight: '800', 
        color: '#1e293b', 
        marginLeft: 8 
    },
    infoBox: { 
        backgroundColor: '#fff', 
        borderRadius: 25, 
        padding: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    infoRow: { 
        flexDirection: 'row', 
        alignItems: 'center'
    },
    rowIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    divider: { 
        height: 1, 
        backgroundColor: '#f1f5f9', 
        marginVertical: 15,
        marginLeft: 55
    },
    rowLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    rowValue: { fontSize: 14, color: '#1e293b', fontWeight: '700', marginTop: 3 },

    /* Botón de Acción */
    historyBtn: { 
        backgroundColor: '#0f172a', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 20, 
        borderRadius: 22, 
        marginTop: 25,
        elevation: 4
    },
    historyBtnContent: { flexDirection: 'row', alignItems: 'center' },
    historyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, marginLeft: 12 },

    /* Tips */
    tipBox: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginTop: 20,
        paddingHorizontal: 20
    },
    tipText: { 
        color: '#94a3b8', 
        fontSize: 12, 
        fontWeight: '500', 
        marginLeft: 8,
        textAlign: 'center'
    }
});