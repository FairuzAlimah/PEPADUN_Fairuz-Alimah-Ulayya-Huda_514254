import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    Text,
    useColorScheme,
    // Import yang dibutuhkan:
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';

import { useGuest } from '@/hooks/use-guest';
import { loginWithEmail } from '@/lib/firebase';

export default function LoginScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { setGuest } = useGuest();

    useEffect(() => {
        if (user) router.replace('/');
    }, [user, router]);

    async function handleLogin() {
        setLoading(true);
        try {
            if (!email || !password) {
                Alert.alert('Login gagal', 'Masukkan email dan password');
                return;
            }
            await loginWithEmail(email, password);
            setGuest(false);
            router.replace('/');
        } catch (err: any) {
            const code = err?.code ?? '';
            if (code === 'auth/user-not-found') {
                Alert.alert('Email belum terdaftar', 'Silakan daftar terlebih dahulu', [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Daftar', onPress: () => router.push('/register') },
                ]);
            } else if (code === 'auth/wrong-password') {
                Alert.alert('Password salah', 'Silakan cek kembali password');
            } else if (code === 'auth/invalid-email') {
                Alert.alert('Email tidak valid', 'Periksa format email Anda');
            } else {
                Alert.alert('Login gagal', err?.message ?? String(err));
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleGuest() {
        setLoading(true);
        try {
            setGuest(true);
            router.replace('/');
        } catch (err: any) {
            Alert.alert('Guest login failed', err?.message ?? String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: isDark ? '#1A1A1A' : '#FFF7F6' },
            ]}
        >
            {/* 🔑 KEYBOARD AVOIDING VIEW CONTAINER */}
            <KeyboardAvoidingView
                style={styles.keyboardContainer} // flex: 1
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Sesuaikan offset jika ada header
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} // Mengatur konten agar tetap di tengah
                    keyboardShouldPersistTaps="handled" // Membantu saat berinteraksi dengan input
                >
                    {/* LOGO */}
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    {/* TITLE */}
                    <Text
                        style={[
                            styles.appTitle,
                            { color: isDark ? '#FFD966' : '#B00020' },
                        ]}
                    >
                        PEPADUN
                    </Text>

                    <Text
                        style={[
                            styles.subtitle,
                            { color: isDark ? '#DDDDDD' : '#555' },
                        ]}
                    >
                        Sai Bumi, Sai Data UMKM
                    </Text>

                    {/* LOGIN CARD */}
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: isDark ? '#2B2B2B' : '#FFFFFF',
                                shadowColor: isDark ? 'transparent' : '#000',
                                borderWidth: isDark ? 1 : 0,
                                borderColor: isDark ? '#444' : 'transparent',
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.cardTitle,
                                { color: isDark ? '#FFD966' : '#B00020' },
                            ]}
                        >
                            Login
                        </Text>

                        {/* EMAIL */}
                        <View style={styles.inputGroup}>
                            <Text
                                style={[
                                    styles.label,
                                    { color: isDark ? '#EEE' : '#444' },
                                ]}
                            >
                                Email
                            </Text>

                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="you@example.com"
                                placeholderTextColor={isDark ? '#AAA' : '#999'}
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: isDark ? '#3A3A3A' : '#FFFDF5',
                                        borderColor: isDark ? '#888' : '#FFD700',
                                        color: isDark ? '#FFF' : '#000',
                                    },
                                ]}
                            />
                        </View>

                        {/* PASSWORD */}
                        <View style={styles.inputGroup}>
                            <Text
                                style={[
                                    styles.label,
                                    { color: isDark ? '#EEE' : '#444' },
                                ]}
                            >
                                Password
                            </Text>

                            <TextInput
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor={isDark ? '#AAA' : '#999'}
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: isDark ? '#3A3A3A' : '#FFFDF5',
                                        borderColor: isDark ? '#888' : '#FFD700',
                                        color: isDark ? '#FFF' : '#000',
                                    },
                                ]}
                            />
                        </View>

                        {/* LOGIN BUTTON */}
                        <TouchableOpacity
                            style={[
                                styles.loginBtn,
                                { backgroundColor: isDark ? '#FFD966' : '#B00020' },
                            ]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text
                                style={[
                                    styles.loginBtnText,
                                    { color: isDark ? '#4A0000' : '#FFD966' },
                                ]}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Text>
                        </TouchableOpacity>

                        {/* GUEST BUTTON */}
                        <TouchableOpacity
                            style={[
                                styles.guestBtn,
                                { backgroundColor: isDark ? '#444' : '#FFD966' },
                            ]}
                            onPress={handleGuest}
                            disabled={loading}
                        >
                            <Text
                                style={[
                                    styles.guestBtnText,
                                    { color: isDark ? '#FFD966' : '#B00020' },
                                ]}
                            >
                                Login as Guest
                            </Text>
                        </TouchableOpacity>

                        {/* REGISTER */}
                        <View style={styles.registerRow}>
                            <Text style={{ color: isDark ? '#DDD' : '#333' }}>
                                Belum punya akun?{' '}
                            </Text>

                            <Link href="/register">
                                <Link.Trigger>
                                    <Text
                                        style={{
                                            fontWeight: 'bold',
                                            color: isDark ? '#FFD966' : '#B00020',
                                        }}
                                    >
                                        Register
                                    </Text>
                                </Link.Trigger>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

// ===================================
// STYLE
// ===================================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Hapus padding dan alignItems/justifyContent dari container luar
        // Biarkan hanya untuk background
    },
    // Tambahkan style untuk KeyboardAvoidingView
    keyboardContainer: {
        flex: 1,
    },
    // Tambahkan style untuk konten ScrollView
    scrollContent: {
        flexGrow: 1, // Agar konten bisa memenuhi ruang vertikal
        padding: 24,
        alignItems: 'center', // Untuk menengahkan konten secara horizontal
        justifyContent: 'center', // Untuk menengahkan konten secara vertikal
    },

    logo: {
        width: 130,
        height: 130,
        marginBottom: 10,
    },

    appTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: 2,
    },

    subtitle: {
        fontSize: 14,
        marginBottom: 22,
    },

    card: {
        width: '100%',
        maxWidth: 400, // Opsional: Batasi lebar card di layar besar
        padding: 22,
        borderRadius: 16,
        elevation: 4,
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },

    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 18,
        textAlign: 'center',
    },

    inputGroup: {
        gap: 6,
        marginBottom: 12,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
    },

    input: {
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: Platform.select({ web: 8, default: 12 }),
        borderRadius: 10,
    },

    loginBtn: {
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 14,
    },

    loginBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    guestBtn: {
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 12,
    },

    guestBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 14,
    },

    regLink: {
        fontWeight: 'bold',
    },
});