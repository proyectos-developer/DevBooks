import React from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    Image, 
    TouchableOpacity, 
    StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Sección Superior: Ilustración o Logo */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>Dev<Text style={styles.logoBold}>Books</Text></Text>
                    <View style={styles.underline} />
                </View>
                <Text style={styles.subtitle}>Gestión Contable Inteligente</Text>
            </View>

            <View style={styles.imageContainer}>
                {/* Aquí puedes poner una ilustración de negocios o el logo de Developer Ideas */}
                <View style={styles.circleDecoration} />
                <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2641/2641140.png' }} 
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>

            {/* Sección Inferior: Botones y Mensaje */}
            <View style={styles.footer}>
                <Text style={styles.welcomeTitle}>Toma el control de tus finanzas</Text>
                <Text style={styles.welcomeDesc}>
                    La plataforma multitenant para contadores modernos. 
                    Sincroniza el SIRE, concilia bancos y gestiona tus empresas en un solo lugar.
                </Text>

                <View style={styles.buttonGroup}>
                    <TouchableOpacity 
                        style={styles.loginBtn}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.registerBtn}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.registerBtnText}>Crear una cuenta</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.brandText}>Powered by Developer Ideas</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        marginTop: 50,
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 32,
        color: '#0f172a',
        letterSpacing: -1,
    },
    logoBold: {
        fontWeight: '900',
        color: '#10b981', // Verde DevBooks
    },
    underline: {
        height: 4,
        width: 40,
        backgroundColor: '#10b981',
        borderRadius: 2,
        marginTop: -2,
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 5,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleDecoration: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#f0fdf4',
    },
    image: {
        width: 200,
        height: 200,
    },
    footer: {
        paddingHorizontal: 30,
        paddingBottom: 40,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 12,
    },
    welcomeDesc: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 35,
    },
    buttonGroup: {
        gap: 15,
    },
    loginBtn: {
        backgroundColor: '#0f172a',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    loginBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    registerBtn: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#f1f5f9',
    },
    registerBtnText: {
        color: '#1e293b',
        fontSize: 16,
        fontWeight: '700',
    },
    brandText: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 12,
        color: '#cbd5e1',
        fontWeight: '600',
    }
});