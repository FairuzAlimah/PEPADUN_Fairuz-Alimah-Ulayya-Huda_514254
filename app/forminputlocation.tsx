import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useGuest } from '@/hooks/use-guest';
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Stack, useRouter } from 'expo-router';
import { initializeApp } from 'firebase/app';
import { getDatabase, push, ref } from 'firebase/database';
import React, { useState } from "react";
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
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// ---------------- THEME COLOR DEFINITION ----------------
const THEME_COLORS = (mode: string) => ({
    background: mode === 'dark' ? '#121212' : '#FFFFFF',
    text: mode === 'dark' ? '#FFFFFF' : '#222222',
    textSecondary: mode === 'dark' ? '#DDDDDD' : '#555555',

    primary: mode === 'dark' ? '#FFD966' : '#8B0000',
    primaryDark: mode === 'dark' ? '#FFD966' : '#B00020',

    cardBG: mode === 'dark' ? '#1E1E1E' : '#FFF2F2',
    cardBorder: mode === 'dark' ? '#333333' : '#FFCCCC',

    inputBG: mode === 'dark' ? '#292929' : '#FFFFFF',
    inputBorder: mode === 'dark' ? '#555555' : '#FFB3B3',

    dropdownBG: mode === 'dark' ? '#333333' : '#FFFFFF',
    dropdownBorder: mode === 'dark' ? '#555555' : '#EEEEEE',

    buttonPrimaryText: mode === 'dark' ? '#121212' : '#FFFFFF',
});

const App = () => {
    const mode = useColorScheme() ?? 'light';
    const C = THEME_COLORS(mode);
    const router = useRouter();
    const { user } = useAuth();
    const { isGuest } = useGuest();

    const [umkmName, setUmkmName] = useState("");
    const [owner, setOwner] = useState("");
    const [contact, setContact] = useState("");
    const [jenisUsaha, setJenisUsaha] = useState('');
    const [showJenis, setShowJenis] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);
    const [location, setLocation] = useState("");
    const [accuration, setAccuration] = useState("");

    // ====== GET CURRENT LOCATION ======
    const getCoordinates = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "Izin akses lokasi diperlukan untuk mengambil koordinat otomatis.");
            return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        const coords = loc.coords.latitude + "," + loc.coords.longitude;
        setLocation(coords);
        const accuracy = loc.coords.accuracy;
        setAccuration(accuracy ? accuracy.toFixed(2) + " m" : "N/A");
    };

    // ====== IMAGE PICKER (GALERI) ======
    const pickImageFromLibrary = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission denied!", "Izin akses galeri diperlukan.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
            setPhoto(result.assets[0].uri);
        }
    };

    // ====== IMAGE CAPTURE (KAMERA) ======
    const takePhotoFromCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied!', 'Izin akses kamera diperlukan.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
            setPhoto(result.assets[0].uri);
        }
    };


    // Firebase Config (Perlu disamarkan untuk keamanan, saya biarkan sesuai aslinya)
    const firebaseConfig = {
        apiKey: "AIzaSyANAcQLp4lbNrJGN7GlNtNaSvP4e6jQNyY",
        authDomain: "responsi-pgpbl-b0c78.firebaseapp.com",
        databaseURL: "https://responsi-pgpbl-b0c78-default-rtdb.firebaseio.com",
        projectId: "responsi-pgpbl-b0c78",
        storageBucket: "responsi-pgpbl-b0c78.firebasestorage.app",
        messagingSenderId: "76695767488",
        appId: "1:76695767488:web:0bc40272d484f239f22025",
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    // ====== SAVE DATA ======
    const saveData = () => {
        // 🛑 Pengecekan Akses (Hanya yang Login yang bisa menyimpan data)
        if (!user || isGuest) {
            Alert.alert('Akses Terbatas', 'Anda harus login untuk dapat menyimpan data UMKM.', [
                { text: 'Batal', style: 'cancel' },
                { text: 'Login', onPress: () => router.push('/login') },
            ]);
            return;
        }
        
        // 🚨 Validasi Data Wajib Diisi
        if (!umkmName || !location || !jenisUsaha) {
            Alert.alert('Validasi Gagal', 'Nama UMKM, Koordinat, dan Jenis Usaha wajib diisi.');
            return;
        }

        const now = new Date().toISOString();

        const locationsRef = ref(db, 'umkm_points/');
        push(locationsRef, {
            umkmName,
            owner,
            contact,
            jenisUsaha,
            photo,
            coordinates: location,
            accuration,
            createdAt: now,
        })
            .then(() => {
                Alert.alert("Success", "Data berhasil disimpan!", [
                    { text: "OK", onPress: () => router.back() },
                ]);
                // Clear form
                setUmkmName("");
                setOwner("");
                setContact("");
                setJenisUsaha('');
                setPhoto(null);
                setLocation("");
                setAccuration("");
            })
            .catch((e: any) => {
                console.error("Error adding data: ", e);
                Alert.alert("Error", "Gagal menyimpan data");
            });
    };

    return (
        <SafeAreaProvider style={{ backgroundColor: C.background }}>
            <SafeAreaView style={{ flex: 1 }}>
                <Stack.Screen options={{
                    title: "Input Data UMKM",
                    headerStyle: { backgroundColor: C.background },
                    headerTintColor: C.text,
                }} />
                
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    {/* Menggunakan `position: 'relative'` pada container untuk dropdown */}
                    <ScrollView style={{ padding: 16 }} contentContainerStyle={{ paddingBottom: 50 }}>
                        {/* CARD */}
                        <View style={[localStyles.card, {
                            backgroundColor: C.cardBG,
                            borderColor: C.cardBorder
                        }]}>
                            <Text style={[localStyles.sectionTitle, { color: C.primaryDark }]}>Form Input UMKM</Text>

                            {/* Input Fields (Nama UMKM) */}
                            <Text style={[localStyles.label, { color: C.text }]}>Nama UMKM</Text>
                            <TextInput
                                style={[localStyles.input, {
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
                            <Text style={[localStyles.label, { color: C.text }]}>Jenis Usaha</Text>
                            <View style={{ zIndex: 10, position: 'relative' }}> 
                                <TouchableOpacity 
                                    style={[localStyles.input, localStyles.dropdownInput, { 
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
                                    // Menggunakan 'localStyles.dropdownList' yang dimodifikasi
                                    <View style={[localStyles.dropdownList, { 
                                        backgroundColor: C.dropdownBG, 
                                        borderColor: C.dropdownBorder,
                                    }]}>
                                        {['Barang', 'Jasa', 'Produksi', 'Lainnya'].map((j) => (
                                            <TouchableOpacity 
                                                key={j} 
                                                style={localStyles.dropdownItem} 
                                                onPress={() => { setJenisUsaha(j); setShowJenis(false); }}
                                            >
                                                <Text style={{ color: C.text }}>{j}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Input Nama Pemilik & Kontak */}
                            <Text style={[localStyles.label, { color: C.text }]}>Nama Pemilik</Text>
                            <TextInput
                                style={[localStyles.input, {
                                    backgroundColor: C.inputBG,
                                    borderColor: C.inputBorder,
                                    color: C.text
                                }]}
                                placeholder="Contoh: Budi Santoso"
                                placeholderTextColor={C.textSecondary}
                                value={owner}
                                onChangeText={setOwner}
                            />

                            <Text style={[localStyles.label, { color: C.text }]}>Kontak</Text>
                            <TextInput
                                style={[localStyles.input, {
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

                            {/* Upload Foto & Kamera */}
                            <Text style={[localStyles.label, { color: C.text }]}>Foto UMKM</Text>
                            <View style={localStyles.imagePickerRow}>
                                {/* Tombol Ambil dari Galeri */}
                                <TouchableOpacity
                                    style={[localStyles.customButton, localStyles.imageButton, { backgroundColor: C.primaryDark }]}
                                    onPress={pickImageFromLibrary}
                                >
                                    <Text style={[localStyles.customButtonText, { color: C.buttonPrimaryText }]}>Ambil dari Galeri</Text>
                                </TouchableOpacity>

                                {/* Tombol Jepret Kamera */}
                                <TouchableOpacity
                                    style={[localStyles.customButton, localStyles.imageButton, { backgroundColor: '#8e1010ff' }]}
                                    onPress={takePhotoFromCamera}
                                >
                                    <Text style={[localStyles.customButtonText, { color: 'white' }]}>Ambil Gambar</Text>
                                </TouchableOpacity>
                            </View>

                            {photo && (
                                <Image source={{ uri: photo }} style={[localStyles.previewImage, { borderColor: C.inputBorder }]} />
                            )}

                            {/* Input Koordinat & Akurasi */}
                            <Text style={[localStyles.label, { color: C.text, marginTop: 20 }]}>Koordinat</Text>
                            <View style={localStyles.locationRow}>
                                <TextInput
                                    style={[localStyles.input, { flex: 1, backgroundColor: C.inputBG, borderColor: C.inputBorder, color: C.text }]}
                                    placeholder="Latitude,Longitude"
                                    placeholderTextColor={C.textSecondary}
                                    value={location}
                                    onChangeText={setLocation}
                                />
                                {/* Tombol Get */}
                                <TouchableOpacity style={[localStyles.customButton, localStyles.smallButton, { backgroundColor: '#007BFF' }]} onPress={getCoordinates}>
                                    <Text style={localStyles.customButtonText}>Get</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={[localStyles.label, { color: C.text }]}>Akurasi GPS</Text>
                            <TextInput
                                style={[localStyles.input, {
                                    backgroundColor: C.inputBG,
                                    borderColor: C.inputBorder,
                                    color: C.text
                                }]}
                                placeholder="Contoh: 5 m"
                                placeholderTextColor={C.textSecondary}
                                value={accuration}
                                onChangeText={setAccuration}
                            />

                            {/* SAVE BUTTON */}
                            <View style={[localStyles.saveButton, { marginHorizontal: 0 }]}>
                                <TouchableOpacity style={[localStyles.savePrimary, { backgroundColor: C.primaryDark }]} onPress={saveData}>
                                    <Text style={[localStyles.savePrimaryText, { color: C.buttonPrimaryText }]}>Simpan Data UMKM</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

// ========== STYLING DIPERBAIKI (Ganti styles menjadi localStyles agar tidak konflik dengan fungsi) ==========
const localStyles = StyleSheet.create({
    card: {
        padding: 18,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
        textAlign: "center",
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        marginTop: 10,
        marginBottom: 4,
    },
    input: {
        height: 42,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    locationRow: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },
    imagePickerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    imageButton: {
        flex: 1,
    },
    previewImage: {
        width: "100%",
        height: 180,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 1,
    },
    saveButton: {
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
        // PERBAIKAN: Hapus 'top: 90' dan sesuaikan 'position'
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 4, // Sedikit jarak dari tombol dropdown
        paddingVertical: 6,
        elevation: 5, // Lebih tinggi dari 3 agar terlihat jelas
        zIndex: 100,
        position: 'absolute',
        top: 48, // Tepat di bawah input dropdown (tinggi input 42 + margin/padding)
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
    },
    dropdownInput: {
        // Style tambahan untuk input dropdown agar terlihat seperti input teks
        height: 42,
        paddingHorizontal: 10,
    }
});

export default App;