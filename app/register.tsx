import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    StyleSheet,
    TextInput,
    View,
    TouchableOpacity,
    Image,
    Text,
    useColorScheme,
    // Import yang dibutuhkan
    Platform,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';

import { ThemedView } from '@/components/themed-view'; // Asumsi ThemedView adalah komponen View sederhana
import { useAuth } from '@/hooks/use-auth';
import { useGuest } from '@/hooks/use-guest';
import { auth, db, registerWithEmail } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database';

export default function RegisterScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { setGuest } = useGuest();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const theme = useColorScheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        if (user) router.replace('/');
    }, [user]);

    async function handleRegister() {
        setLoading(true);
        try {
            if (!email || !password || !name) {
                Alert.alert('Data Kurang', 'Semua kolom wajib diisi.');
                return;
            }

            await registerWithEmail(email, password);

            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: name });

                const usersRef = ref(db, `users/${auth.currentUser.uid}`);
                await set(usersRef, {
                    name,
                    email,
                    createdAt: new Date().toISOString(),
                });
            }

            Alert.alert('Success', 'Akun berhasil dibuat');
            setGuest(false);
            router.replace('/');
        } catch (err: any) {
            Alert.alert('Gagal membuat akun', err?.message ?? String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <ThemedView
            style={[
                styles.fullContainer, // Menggunakan style fullContainer untuk mengisi layar
                { backgroundColor: isDark ? '#1A1A1A' : '#FFF7F0' },
            ]}
        >
            {/* 🔑 KEYBOARD AVOIDING VIEW CONTAINER */}
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Sesuaikan jika ada header
            >
                {/* SCROLL VIEW UNTUK MENGGESER KONTEN */}
                <ScrollView
                    contentContainerStyle={styles.scrollContent} // Memastikan konten di tengah
                    keyboardShouldPersistTaps="handled" 
                >
                    {/* Logo */}
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    {/* Title */}
                    <Text
                        style={[
                            styles.title,
                            { color: isDark ? '#FFD966' : '#B00020' },
                        ]}
                    >
                        PEPADUN
                    </Text>

                    <Text
                        style={[
                            styles.subtitle,
                            { color: isDark ? '#FFD966' : '#B00020' },
                        ]}
                    >
                        Register Akun
                    </Text>

                    {/* Registrasi Card (Opsional, tapi membantu untuk padding) */}
                    <View style={styles.card}>
                        
                        {/* Input Nama */}
                        <View style={styles.inputGroup}>
                            <Text
                                style={[
                                    styles.inputLabel,
                                    { color: isDark ? '#EEE' : '#6A0000' },
                                ]}
                            >
                                Nickname
                            </Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="Masukkan nama Anda"
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: isDark ? '#333' : '#fff',
                                        borderColor: isDark ? '#FFD966' : '#B00020',
                                        color: isDark ? '#FFF' : '#000',
                                    },
                                ]}
                                placeholderTextColor={isDark ? '#AAA' : '#888'}
                            />
                        </View>

                        {/* Input Email */}
                        <View style={styles.inputGroup}>
                            <Text
                                style={[
                                    styles.inputLabel,
                                    { color: isDark ? '#EEE' : '#6A0000' },
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
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: isDark ? '#333' : '#fff',
                                        borderColor: isDark ? '#FFD966' : '#B00020',
                                        color: isDark ? '#FFF' : '#000',
                                    },
                                ]}
                                placeholderTextColor={isDark ? '#AAA' : '#888'}
                            />
                        </View>

                        {/* Input Password */}
                        <View style={styles.inputGroup}>
                            <Text
                                style={[
                                    styles.inputLabel,
                                    { color: isDark ? '#EEE' : '#6A0000' },
                                ]}
                            >
                                Password
                            </Text>
                            <TextInput
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: isDark ? '#333' : '#fff',
                                        borderColor: isDark ? '#FFD966' : '#B00020',
                                        color: isDark ? '#FFF' : '#000',
                                    },
                                ]}
                                placeholderTextColor={isDark ? '#AAA' : '#888'}
                            />
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity
                            style={[
                                styles.button,
                                { backgroundColor: isDark ? '#FFD966' : '#B00020' },
                            ]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    { color: isDark ? '#000' : '#FFD966' },
                                ]}
                            >
                                {loading ? 'Membuat Akun...' : 'Register'}
                            </Text>
                        </TouchableOpacity>

                        {/* Back to Login */}
                        <TouchableOpacity onPress={() => router.push('/login')}>
                            <Text
                                style={{
                                    marginTop: 5,
                                    color: isDark ? '#DDD' : '#333',
                                    fontWeight: 'normal',
                                    textAlign: 'center', // Agar teks berada di tengah
                                }}
                            >
                                Sudah punya akun?{' '}
                                <Text style={{ fontWeight: 'bold', color: isDark ? '#FFD966' : '#B00020' }}>
                                    Login
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

// ===================================
// STYLE
// ===================================
const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
    },
    keyboardContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1, // Memungkinkan ScrollView mengisi ruang
        padding: 24,
        alignItems: 'center', // Menengahkan horizontal
        justifyContent: 'center', // Menengahkan vertikal saat layar penuh
    },
    
    // Tambahkan style untuk card agar input group tidak terlalu lebar
    card: {
        width: '100%',
        maxWidth: 400, // Batasi lebar seperti di login screen
    },

    logo: {
        width: 130,
        height: 130,
        marginBottom: 10,
    },

    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },

    subtitle: {
        fontSize: 16,
        marginBottom: 20,
    },

    inputGroup: {
        width: '100%',
        marginBottom: 14,
    },

    inputLabel: {
        fontSize: 14,
        marginBottom: 6,
    },

    input: {
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 10,
        fontSize: 16,
    },

    button: {
        paddingVertical: 14,
        width: '100%',
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 10,
        elevation: 3,
    },

    buttonText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
});