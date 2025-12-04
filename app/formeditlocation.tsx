import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
    KeyboardAvoidingView, 
    Platform, 
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/use-auth';
import { useGuest } from '@/hooks/use-guest';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { initializeApp } from 'firebase/app';
import { getDatabase, push, ref, update } from 'firebase/database';

// ---------------- THEME COLOR DEFINITION ----------------
const THEME_COLORS = (mode: string) => ({
    background: mode === 'dark' ? '#121212' : '#FFFFFF',
    text: mode === 'dark' ? '#FFFFFF' : '#222222',
    textSecondary: mode === 'dark' ? '#DDDDDD' : '#555555',
    
    // Warna Utama: Merah/Kuning
    primary: mode === 'dark' ? '#FFD966' : '#8B0000',
    primaryDark: mode === 'dark' ? '#FFD966' : '#B00020', // Merah yang lebih kuat untuk judul dan tombol utama
    
    cardBG: mode === 'dark' ? '#1E1E1E' : '#FFF2F2', // Latar belakang card (Merah Muda di Light)
    cardBorder: mode === 'dark' ? '#333333' : '#FFCCCC', // Border card
    
    inputBG: mode === 'dark' ? '#292929' : '#FFFFFF',
    inputBorder: mode === 'dark' ? '#555555' : '#FFB3B3',
    
    dropdownBG: mode === 'dark' ? '#333333' : '#FFFFFF',
    dropdownBorder: mode === 'dark' ? '#555555' : '#EEEEEE',
    
    // Teks tombol primer (Hitam di Dark Mode, Putih di Light Mode)
    buttonPrimaryText: mode === 'dark' ? '#121212' : '#FFFFFF', 
    
    // Warna sekunder untuk tombol kamera (Hijau statis)
    cameraButton: '#388E3C', 
});

const App = () => {
    const router = useRouter();
    const mode = useColorScheme() ?? 'light';
    const C = THEME_COLORS(mode);

    const params = useLocalSearchParams();
    const {
        id,
        umkmName: initialUmkmName,
        name: initialName,
        owner: initialOwner,
        contact: initialContact,
        photo: initialPhoto,
        coordinates: initialCoordinates,
        accuration: initialAccuration,
        jenisUsaha: initialJenisUsaha,
    } = params;
    
    // State definitions
    const [umkmName, setUmkmName] = useState(String(initialUmkmName ?? initialName ?? ''));
    const [owner, setOwner] = useState(String(initialOwner ?? ''));
    const [contact, setContact] = useState(String(initialContact ?? ''));
    const [photo, setPhoto] = useState<string | null>(String(initialPhoto ?? '') || null);
    const [jenisUsaha, setJenisUsaha] = useState(String(initialJenisUsaha ?? '') || '');
    const [showJenis, setShowJenis] = useState(false);
    const [location, setLocation] = useState(String(initialCoordinates ?? ''));
    const [accuration, setAccuration] = useState(String(initialAccuration ?? ''));

    // Get current location
    const getCoordinates = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission to access location was denied");
            return;
        }
        let location = await Location.getCurrentPositionAsync({});
        const coords = location.coords.latitude + "," + location.coords.longitude;
        setLocation(coords);
        const accuracy = location.coords.accuracy;
        setAccuration(accuracy ? accuracy.toFixed(2) + " m" : "N/A");
    };

    // 📸 Ambil Foto dari Kamera
    const takePhotoFromCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied!', 'Izin akses kamera diperlukan.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
            setPhoto(result.assets[0].uri);
        }
    };
    
    // 🖼️ Ambil dari Galeri
    const pickImageFromLibrary = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied!', 'Izin akses galeri diperlukan.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
            setPhoto(result.assets[0].uri);
        }
    };

    // Firebase Config
    const firebaseConfig = {
        apiKey: "AIzaSyANAcQLp4lbNrJGN7GlNtNaSvP4e6jQNyY",
        authDomain: "responsi-pgpbl-b0c78.firebaseapp.com",
        databaseURL: "https://responsi-pgpbl-b0c78-default-rtdb.firebaseio.com",
        projectId: "responsi-pgpbl-b0c78",
        storageBucket: "responsi-pgpbl-b0c78.firebasestorage.app",
        messagingSenderId: "76695767488",
        appId: "1:76695767488:web:0bc40272d484f239f22025"
    };
    
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    const { user } = useAuth();
    const { isGuest } = useGuest();

    // Alert success update
    const createOneButtonAlert = (callback: () => void) =>
        Alert.alert("Success", "Berhasil memperbarui data", [
            { text: "OK", onPress: callback },
        ]);
        
    // Handle Update Data
    const handleUpdate = () => {
        if (!user || isGuest) {
            Alert.alert('Akses terbatas', 'Silakan login untuk mengedit lokasi', [
                { text: 'Batal', style: 'cancel' },
                { text: 'Login', onPress: () => router.push('/login') },
            ]);
            return;
        }
        if (!id) {
            Alert.alert("Error", "ID lokasi tidak ditemukan.");
            return;
        }
        const pointRef = ref(db, `umkm_points/${id}`);
        update(pointRef, {
            umkmName: umkmName,
            owner: owner,
            contact: contact,
            jenisUsaha: jenisUsaha,
            photo: photo,
            coordinates: location,
            accuration: accuration,
        })
            .then(() => {
                createOneButtonAlert(() => {
                    router.back();
                });
            })
            .catch((e) => {
                console.error("Error updating document: ", e);
                Alert.alert("Error", "Gagal memperbarui data");
            });
    };

    // Handle Save Data Baru
    const handleSave = () => {
        if (!user || isGuest) {
            Alert.alert('Akses terbatas', 'Silakan login untuk menambah lokasi', [
                { text: 'Batal', style: 'cancel' },
                { text: 'Login', onPress: () => router.push('/login') },
            ]);
            return;
        }
        // Validasi minimal
        if (!umkmName || !location || !jenisUsaha) {
            Alert.alert('Data Kurang', 'Nama UMKM, Koordinat, dan Jenis Usaha wajib diisi.');
            return;
        }

        const locationsRef = ref(db, 'umkm_points/');
        push(locationsRef, {
            umkmName,
            owner,
            contact,
            jenisUsaha,
            photo,
            coordinates: location,
            accuration,
            createdAt: new Date().toISOString(),
        })
            .then(() => {
                Alert.alert("Success", "Berhasil menyimpan data baru", [
                    { text: "OK", onPress: () => router.back() },
                ]);
                // Reset state setelah save
                setUmkmName('');
                setOwner('');
                setContact('');
                setPhoto(null);
                setLocation("");
                setAccuration("");
                setJenisUsaha("");
            })
            .catch((e: any) => {
                console.error("Error adding document: ", e);
                Alert.alert("Error", "Gagal menyimpan data");
            });
    }

    const currentTitle = id ? 'Form Edit UMKM' : 'Form Tambah UMKM';
    
    return (
        <SafeAreaProvider style={{ backgroundColor: C.background }}>
            <SafeAreaView style={{ flex: 1 }}> 
                <Stack.Screen options={{ 
                    title: currentTitle, 
                    headerStyle: { backgroundColor: C.background },
                    headerTintColor: C.text,
                }} />
                
                {/* 🔑 Implementasi KeyboardAvoidingView */}
                <KeyboardAvoidingView 
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    // Penyesuaian Offset untuk iOS (sesuaikan dengan tinggi header navigasi)
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 44 : 0} 
                >
                    {/* ScrollView untuk menampung konten form */}
                    <ScrollView 
                        style={{ paddingHorizontal: 16 }} 
                        contentContainerStyle={{ paddingBottom: 120 }} // Tambah padding bawah untuk ruang gerak keyboard
                        keyboardShouldPersistTaps="handled" // Penting untuk memastikan dropdown bisa ditutup
                    >
                        <View style={[styles.card, { 
                            backgroundColor: C.cardBG, 
                            borderColor: C.cardBorder 
                        }]}>
                            <Text style={[styles.sectionTitle, { color: C.primaryDark }]}>{currentTitle}</Text>

                            {/* Input Nama UMKM */}
                            <Text style={[styles.label, { color: C.text }]}>Nama UMKM</Text>
                            <TextInput
                                style={[styles.input, { 
                                    backgroundColor: C.inputBG, 
                                    borderColor: C.inputBorder, 
                                    color: C.text 
                                }]}
                                placeholder="Contoh: Kedai Kopi Nusantara"
                                placeholderTextColor={C.textSecondary}
                                value={umkmName}
                                onChangeText={setUmkmName}
                            />

                            {/* Jenis Usaha (Dropdown) */}
                            {/* Beri zIndex pada container dropdown agar tampil di atas elemen lain */}
                            <Text style={[styles.label, { color: C.text }]}>Jenis Usaha</Text>
                            <View style={{ zIndex: 10 }}> 
                                <TouchableOpacity 
                                    style={[styles.input, styles.dropdownInput, { 
                                        justifyContent: 'center', 
                                        backgroundColor: C.inputBG, 
                                        borderColor: C.inputBorder,
                                    }]} 
                                    onPress={() => setShowJenis(!showJenis)}
                                >
                                    <Text style={{ color: jenisUsaha ? C.text : C.textSecondary }}>
                                        {jenisUsaha || 'Pilih jenis usaha'}
                                    </Text>
                                </TouchableOpacity>
                                {showJenis && (
                                    <View style={[styles.dropdownList, { 
                                        backgroundColor: C.dropdownBG, 
                                        borderColor: C.dropdownBorder,
                                        // 'zIndex' sudah ada di parent, tidak perlu 'position: absolute' jika ingin ikut scroll
                                    }]}>
                                        {['Barang', 'Jasa', 'Produksi', 'Lainnya'].map((j) => (
                                            <TouchableOpacity 
                                                key={j} 
                                                style={styles.dropdownItem} 
                                                onPress={() => { setJenisUsaha(j); setShowJenis(false); }}
                                            >
                                                <Text style={{ color: C.text }}>{j}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Input Nama Pemilik */}
                            <Text style={[styles.label, { color: C.text }]}>Nama Pemilik</Text>
                            <TextInput
                                style={[styles.input, { 
                                    backgroundColor: C.inputBG, 
                                    borderColor: C.inputBorder, 
                                    color: C.text 
                                }]}
                                placeholder="Contoh: Budi Santoso"
                                placeholderTextColor={C.textSecondary}
                                value={owner}
                                onChangeText={setOwner}
                            />

                            {/* Input Kontak */}
                            <Text style={[styles.label, { color: C.text }]}>Kontak</Text>
                            <TextInput
                                style={[styles.input, { 
                                    backgroundColor: C.inputBG, 
                                    borderColor: C.inputBorder, 
                                    color: C.text 
                                }]}
                                placeholder="Contoh: 0812xxxx"
                                placeholderTextColor={C.textSecondary}
                                value={contact}
                                onChangeText={setContact}
                                keyboardType="phone-pad"
                            />

                            {/* Input Foto UMKM */}
                            <Text style={[styles.label, { color: C.text }]}>Foto UMKM</Text>
                            <View style={styles.imagePickerRow}>
                                <TouchableOpacity 
                                    style={[styles.customButton, styles.imageButton, {backgroundColor: C.primaryDark}]} 
                                    onPress={pickImageFromLibrary}
                                >
                                    <Text style={[styles.customButtonText, { color: C.buttonPrimaryText }]}>Ambil dari Galeri</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.customButton, styles.imageButton, {backgroundColor: "#8e1010ff"}]} 
                                    onPress={takePhotoFromCamera}
                                >
                                    <Text style={[styles.customButtonText, { color: 'white' }]}>Ambil Gambar</Text>
                                </TouchableOpacity>
                            </View>
                            
                            {photo ? <Image source={{ uri: String(photo) }} style={[styles.previewImage, {borderColor: C.inputBorder}]} /> : null}
                            
                            {/* Input Koordinat */}
                            <Text style={[styles.label, { color: C.text, marginTop: 20 }]}>Koordinat</Text>
                            <View style={styles.locationRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1, backgroundColor: C.inputBG, borderColor: C.inputBorder, color: C.text }]}
                                    placeholder="Latitude,Longitude"
                                    placeholderTextColor={C.textSecondary}
                                    value={location}
                                    onChangeText={setLocation}
                                />
                                {/* Tombol Get */}
                                <TouchableOpacity style={[styles.customButton, styles.smallButton, {backgroundColor: '#007BFF'}]} onPress={getCoordinates}>
                                    <Text style={styles.customButtonText}>Get</Text> 
                                </TouchableOpacity>
                            </View>

                            {/* Input Akurasi */}
                            <Text style={[styles.label, { color: C.text }]}>Akurasi GPS</Text>
                            <TextInput
                                style={[styles.input, { 
                                    backgroundColor: C.inputBG, 
                                    borderColor: C.inputBorder, 
                                    color: C.text 
                                }]}
                                placeholder="Contoh: 5 m"
                                placeholderTextColor={C.textSecondary}
                                value={accuration}
                                onChangeText={setAccuration}
                            />
                        </View>
                        
                        {/* Tombol Save/Update Final */}
                        <View style={styles.finalSaveButtonContainer}> 
                            <TouchableOpacity
                                style={[styles.savePrimary, { 
                                    backgroundColor: C.primaryDark 
                                }]}
                                onPress={id ? handleUpdate : handleSave}
                            >
                                <Text style={[styles.savePrimaryText, {color: C.buttonPrimaryText}]}>{id ? 'Update Data' : 'Simpan Data'}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

// ---------------- STYLESHEET ----------------
const styles = StyleSheet.create({
    card: {
        padding: 18,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 4,
    },
    input: {
        height: 42,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    dropdownInput: {
        paddingHorizontal: 10,
    },
    locationRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    imagePickerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    imageButton: {
        flex: 1,
    },
    previewImage: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 1,
    },
    finalSaveButtonContainer: {
        marginTop: 20, 
    },
    savePrimary: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    savePrimaryText: {
        fontWeight: '700',
        fontSize: 16,
    },
    dropdownList: {
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 6,
        paddingVertical: 6,
        elevation: 3, 
        width: '100%',
    },
    dropdownItem: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    customButton: {
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    customButtonText: {
        fontWeight: '600',
        color: 'white', 
    },
    smallButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    }
});

export default App;