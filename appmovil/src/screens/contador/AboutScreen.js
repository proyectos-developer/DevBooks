import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    StatusBar, Dimensions, Image, Linking 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../redux/axios_auth';
import { perfilcontadordata } from '../../redux/contador/perfilcontadordata.js';
import { perfilcontadorConstants } from '../../uri/contador/perfilcontador-constants.js';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function AboutScreen({ navigation }) {

    const dispatch = useDispatch()

    const [info, setInfo] = useState({ version: '1.0.4', agencia: 'Developer Ideas' });

    const {get_sistema_info} = useSelector(({perfilcontador_data}) => perfilcontador_data)

    useFocusEffect(
        useCallback(() => {
            loadData ()
        }, [])
    )

    const loadData = () => {
        dispatch (perfilcontadordata(perfilcontadorConstants('0', {}, false).get_sistema_info))
    }

    useEffect(() => {
        if (get_sistema_info?.data){
            setInfo(get_sistema_info.data)
        }
    }, [get_sistema_info])

    const openLink = (url) => Linking.openURL(url);

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
                    <Text style={styles.headerTitle}>Acerca de</Text>
                </View>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.logoSection}>
                    <View style={styles.logoPlaceholder}>
                        <Ionicons name="book" size={60} color="#10b981" />
                    </View>
                    <Text style={styles.appName}>DevBooks PRO</Text>
                    <Text style={styles.versionLabel}>Versión {info.version}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Desarrollado por</Text>
                    <Text style={styles.agenciaName}>{info.agencia}</Text>
                    <Text style={styles.description}>
                        Solución integral de gestión contable diseñada para contadores modernos. 
                        Sincronización con SUNAT y automatización de procesos bancarios.
                    </Text>
                    
                    <TouchableOpacity 
                        style={styles.webBtn}
                        onPress={() => openLink('https://developerideas.com')}
                    >
                        <Text style={styles.webBtnText}>Visitar sitio web</Text>
                        <Ionicons name="open-outline" size={16} color="#10b981" />
                    </TouchableOpacity>
                </View>

                <View style={styles.menuSection}>
                    <AboutOption icon="document-text-outline" title="Términos y Condiciones" onPress={() => {}} />
                    <AboutOption icon="shield-outline" title="Política de Privacidad" onPress={() => {}} />
                    <AboutOption icon="star-outline" title="Calificar aplicación" onPress={() => {}} />
                </View>

                <Text style={styles.copyright}>© 2026 Developer Ideas. Todos los derechos reservados.</Text>
            </ScrollView>
        </View>
    );
}

const AboutOption = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
        <Ionicons name={icon} size={20} color="#64748b" />
        <Text style={styles.optionTitle}>{title}</Text>
        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerContainer: { height: 160, position: 'absolute', top: 0, width: '100%', zIndex: 10 },
    headerBg: { position: 'absolute', width: width, height: 160, backgroundColor: '#0f172a', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerContent: { paddingHorizontal: 25, paddingTop: 60, flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
    
    scrollContent: { paddingHorizontal: 25, paddingTop: 180, paddingBottom: 140 },
    
    logoSection: { alignItems: 'center', marginBottom: 30 },
    logoPlaceholder: { width: 100, height: 100, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#10b981', shadowOpacity: 0.2, shadowRadius: 10 },
    appName: { fontSize: 24, fontWeight: '900', color: '#0f172a', marginTop: 15 },
    versionLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '700', marginTop: 5 },

    card: { backgroundColor: '#fff', borderRadius: 30, padding: 25, alignItems: 'center', elevation: 2 },
    cardTitle: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
    agenciaName: { fontSize: 18, fontWeight: '900', color: '#10b981', marginTop: 5 },
    description: { textAlign: 'center', color: '#64748b', fontSize: 14, lineHeight: 22, marginVertical: 15 },
    webBtn: { flexDirection: 'row', alignItems: 'center', padding: 10 },
    webBtnText: { color: '#10b981', fontWeight: '800', marginRight: 8 },

    menuSection: { marginTop: 25 },
    option: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 20, marginBottom: 10 },
    optionTitle: { flex: 1, marginLeft: 15, fontSize: 15, fontWeight: '700', color: '#1e293b' },
    
    copyright: { textAlign: 'center', color: '#cbd5e1', fontSize: 11, marginTop: 20, fontWeight: '600' }
});