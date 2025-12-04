import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { FontAwesome5 } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { onValue, ref, remove } from "firebase/database";

// ---------------- THEME COLOR ----------------
const COLORS = (mode: string) => ({
  background: mode === "dark" ? "#121212" : "#FFF7F6",
  text: mode === "dark" ? "#FFFFFF" : "#222222",
  textSecondary: mode === "dark" ? "#DDDDDD" : "#555555",

  // WARNA UTAMA YANG LEBIH ELEGAN
  primary: mode === "dark" ? "#FFD966" : "#8B0000",

  cardBG: mode === "dark" ? "#1E1E1E" : "#FFFFFF",
  cardBorder: mode === "dark" ? "#333333" : "#E3E3E3",

  searchBG: mode === "dark" ? "#1C1C1C" : "#F4F4F4",
  filterBG: mode === "dark" ? "#1A1A1A" : "#fdffe4ff",

  pickerBG: mode === "dark" ? "#1A1A1A" : "#ffffffff",
  pickerText: mode === "dark" ? "#FFFFFF" : "#222222",
});

interface UmkmPoint {
  id: string;
  umkmName?: string;
  owner?: string;
  contact?: string;
  photo?: string;
  coordinates?: string;
  jenisUsaha?: string;
}

export default function LokasiScreen() {
  const mode = useColorScheme() ?? "light";
  const C = COLORS(mode);

  const [sections, setSections] = useState<{ title: string; data: UmkmPoint[] }[]>([]);
  const [rawData, setRawData] = useState<UmkmPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false); // Tambahkan state untuk dropdown

  const router = useRouter();
  const { user } = useAuth();

  const handleEdit = (item: UmkmPoint) => {
    if (!user) {
      Alert.alert("Login Required", "Silakan login terlebih dahulu untuk mengedit data.");
      return;
    }
    router.push({ pathname: "/formeditlocation", params: item });
  };

  const handleDelete = (id: string) => {
    if (!user) {
      Alert.alert("Login Required", "Silakan login terlebih dahulu untuk menghapus data.");
      return;
    }
    Alert.alert("Hapus UMKM", "Yakin ingin menghapus data ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: () => remove(ref(db, `umkm_points/${id}`)) },
    ]);
  };

  const handlePressMap = (coordinates?: string) => {
    if (!coordinates) return;
    const [lat, lon] = coordinates.split(",");
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Gagal membuka Google Maps"));
  };

  const handlePressContact = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert("Error", "Gagal membuka dial telepon"));
  };

  useEffect(() => {
    const pointsRef = ref(db, "umkm_points");
    const unsubscribe = onValue(pointsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setRawData([]);
        setSections([{ title: "Daftar UMKM", data: [] }]);
        setLoading(false);
        return;
      }

      const arr: UmkmPoint[] = Object.keys(data).map((key) => ({
        id: key,
        umkmName: data[key].umkmName || "",
        owner: data[key].owner || "",
        contact: data[key].contact || "",
        photo: data[key].photo || "",
        coordinates: data[key].coordinates || "",
        jenisUsaha: data[key].jenisUsaha || "",
        createdAt: data[key].createdAt || 0,
      }));

      arr.sort((a: any, b: any) => b.createdAt - a.createdAt);

      setRawData(arr);
      applyFilter(arr);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const applyFilter = (data: UmkmPoint[]) => {
    let filtered = data;

    if (filterJenis !== "all") filtered = filtered.filter((item) => item.jenisUsaha === filterJenis);

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.umkmName || "").toLowerCase().includes(q) ||
          (item.owner || "").toLowerCase().includes(q)
      );
    }

    setSections([{ title: "Daftar UMKM", data: filtered }]);
  };

  useEffect(() => {
    applyFilter(rawData);
  }, [rawData, searchQuery, filterJenis]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: C.background }]}>
      
      {/* HEADER */}
      <View style={styles.headerRow}>
        <ThemedText type="title" style={[styles.headerTitle, { color: C.primary }]}>
          Lokasi UMKM
        </ThemedText>

        <TouchableOpacity onPress={() => router.push("/profile")}>
          <FontAwesome5 name="user-circle" size={32} color={C.primary} />
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={[styles.searchBar, { backgroundColor: C.searchBG, borderColor: C.cardBorder }]}>
        <FontAwesome5 name="search" size={18} color={C.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Cari nama UMKM / pemilik..."
          placeholderTextColor={C.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: C.text }]}
        />
      </View>

      {/* FILTER BOX */}
      <View
        style={[
          styles.filterBox,
          {
            backgroundColor: C.filterBG,
            borderColor: C.primary,
          },
        ]}
      >
        {/* TOMBOL DROPDOWN */}
        <TouchableOpacity
          onPress={() => setDropdownOpen((prev) => !prev)}
          activeOpacity={0.7}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: C.pickerBG,
            borderWidth: 1,
            borderColor: C.primary,
          }}
        >
          <Text style={{ color: C.pickerText, fontSize: 15, fontWeight: "600" }}>
            {filterJenis === "all" ? "Semua Jenis Usaha" : filterJenis}
          </Text>
        </TouchableOpacity>

        {/* LIST DROPDOWN */}
        {dropdownOpen && (
          <View
            style={{
              position: "absolute",
              top: "100%", // Muncul di bawah box
              left: 0,
              right: 0,
              backgroundColor: C.pickerBG,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: C.primary,
              overflow: "hidden",
              elevation: 5,
              zIndex: 10, // Pastikan di atas elemen lain
            }}
          >
            {[
              { label: "Semua Jenis Usaha", value: "all" },
              { label: "Barang", value: "Barang" },
              { label: "Jasa", value: "Jasa" },
              { label: "Produksi", value: "Produksi" },
              { label: "Lainnya", value: "Lainnya" },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => {
                  setFilterJenis(item.value);
                  setDropdownOpen(false);
                }}
                style={{ paddingVertical: 12, paddingHorizontal: 14 }}
              >
                <Text style={{ fontSize: 15, color: C.pickerText }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ThemedText style={[styles.stickyTitle, { color: C.text }]}>Daftar UMKM</ThemedText>

      {/* LIST */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 10 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: C.cardBG, borderColor: C.cardBorder }]}>
            
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoPlaceholder]}>
                <FontAwesome5 name="image" size={28} color={C.textSecondary} />
              </View>
            )}

            <View style={styles.cardContent}>
              <Text style={[styles.titleText, { color: C.text }]}>{item.umkmName}</Text>
              <Text style={[styles.cardText, { color: C.textSecondary }]}>
                Pemilik: {item.owner || "-"}
              </Text>

              <Text style={[styles.cardText, { color: C.textSecondary }]}>
                Jenis: {item.jenisUsaha || "-"}
              </Text>

              <TouchableOpacity onPress={() => handlePressContact(item.contact)}>
                <Text style={[styles.contactText, { color: C.textSecondary }]}>
                  Kontak:{" "}
                  <Text style={{ color: "#4CAF50", textDecorationLine: "underline" }}>
                    {item.contact}
                  </Text>
                </Text>
              </TouchableOpacity>

              <View style={styles.cardButtons}>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#007BFF" }]}
                  onPress={() => handlePressMap(item.coordinates)}
                >
                  <FontAwesome5 name="map-marked-alt" size={16} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#FFC107" }]}
                  onPress={() => handleEdit(item)}
                >
                  <FontAwesome5 name="edit" size={16} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#B00020" }]}
                  onPress={() => handleDelete(item.id)}
                >
                  <FontAwesome5 name="trash" size={16} color="white" />
                </TouchableOpacity>

              </View>
            </View>

          </View>
        )}
      />

    </SafeAreaView>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  headerTitle: { fontSize: 26, fontWeight: "bold" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
    borderWidth: 1,
  },

  searchInput: { flex: 1, fontSize: 15 },

  filterBox: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    position: "relative", // Untuk positioning dropdown
  },

  stickyTitle: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 8,
  },

  card: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  photo: { width: 90, height: 90, borderRadius: 10 },

  photoPlaceholder: { justifyContent: "center", alignItems: "center" },

  cardContent: { flex: 1, marginLeft: 12 },

  titleText: { fontSize: 17, fontWeight: "bold" },

  cardText: { marginTop: 4, fontSize: 14 },

  contactText: { marginTop: 4, fontSize: 14 },

  cardButtons: { flexDirection: "row", marginTop: 10, gap: 10 },

  btn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
});
