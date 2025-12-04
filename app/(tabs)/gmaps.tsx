// app/(tabs)/gmaps.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  Dimensions,
  FlatList,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { onValue, ref, remove } from "firebase/database";
import * as Location from "expo-location";
import { db } from "@/lib/firebase";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { useGuest } from "@/hooks/use-guest";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Import useSafeAreaInsets

const { width: SCREEN_W } = Dimensions.get("window");

interface UmkmPoint {
  id: string;
  umkmName?: string;
  owner?: string;
  contact?: string;
  photo?: string;
  accuration?: string;
  jenisUsaha?: string;
  latitude?: number;
  longitude?: number;
  coordinates?: string;
  createdAt?: string;
}

export default function Gmaps() {
  const dark = useColorScheme() === "dark";
  const router = useRouter();
  const { user } = useAuth();
  const { isGuest } = useGuest();
  const insets = useSafeAreaInsets(); // Get safe area insets

  const [points, setPoints] = useState<UmkmPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<UmkmPoint | null>(null);

  // Legend/filter states (now in TOP LEFT adjusted)
  const [legendOpen, setLegendOpen] = useState(false);
  const [filterDagang, setFilterDagang] = useState(true);
  const [filterProduksi, setFilterProduksi] = useState(true);
  const [filterJasa, setFilterJasa] = useState(true);
  const [filterLainnya, setFilterLainnya] = useState(true);

  // Search states (now in TOP RIGHT)
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // location & map refs
  const mapRef = useRef<MapView | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);

  // animation values for legend slide (adjusted for slight right/down starting pos)
  const legendTranslate = useRef(new Animated.Value(-200)).current;
  useEffect(() => {
    Animated.timing(legendTranslate, {
      toValue: legendOpen ? 0 : -80, // horizontal slide for top left
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [legendOpen, legendTranslate]);

  // initial region (Bandar Lampung / Balam)
  const initialRegion: Region = {
    latitude: -5.40323237132275,
    longitude: 105.2659788922653,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  // fetch points from firebase
  useEffect(() => {
    setLoading(true);
    const pointsRef = ref(db, "umkm_points/");
    const unsub = onValue(
      pointsRef,
      (snap) => {
        const data = snap.val();
        if (!data) {
          setPoints([]);
          setLoading(false);
          return;
        }

        const parsed: UmkmPoint[] = Object.keys(data)
          .map((k) => {
            const p = data[k];
            // handle both coordinate string and numeric lat/lon fields
            let lat = undefined as number | undefined;
            let lon = undefined as number | undefined;

            if (p.coordinates && typeof p.coordinates === "string") {
              const parts = p.coordinates
                .split(",")
                .map((s: string) => s.trim());
              const a = parseFloat(parts[0]);
              const b = parseFloat(parts[1]);
              if (!Number.isNaN(a) && !Number.isNaN(b)) {
                lat = a;
                lon = b;
              }
            }

            if (
              (lat === undefined || lon === undefined) &&
              p.latitude &&
              p.longitude
            ) {
              const a = parseFloat(String(p.latitude));
              const b = parseFloat(String(p.longitude));
              if (!Number.isNaN(a) && !Number.isNaN(b)) {
                lat = a;
                lon = b;
              }
            }

            if (lat === undefined || lon === undefined) return null;

            return {
              id: k,
              umkmName: p.umkmName ?? "",
              owner: p.owner ?? "",
              contact: p.contact ?? "",
              photo: p.photo ?? "",
              accuration: p.accuration ?? "",
              jenisUsaha: p.jenisUsaha ?? "",
              latitude: lat,
              longitude: lon,
              coordinates: p.coordinates ?? `${lat},${lon}`,
              createdAt: p.createdAt ?? "",
            } as UmkmPoint;
          })
          .filter(Boolean) as UmkmPoint[];

        setPoints(parsed);
        setLoading(false);
      },
      (err) => {
        console.error("firebase read error", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // helper categorize
  const categorize = (jenis?: string) => {
    if (!jenis) return "lainnya";
    const k = jenis.toLowerCase();
    if (k.includes("barang") || k.includes("dagang")) return "dagang";
     if (k.includes("jasa")) return "jasa";
    if (k.includes("produksi")) return "produksi";
    return "lainnya";
  };

  const getIconForType = (jenis?: string) => {
    if (!jenis) return require("@/assets/images/icon.png");
    const k = jenis.toLowerCase();
    if (k.includes("barang") || k.includes("dagang"))
      return require("@/assets/images/dagang.png");
    if (k.includes("jasa")) return require("@/assets/images/jasa.png");
    if (k.includes("produksi")) return require("@/assets/images/produksi.png");
    return require("@/assets/images/lainnya.png");
  };

  // filtered + searched points
  const filteredPoints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return points.filter((p) => {
      const cat = categorize(p.jenisUsaha);
      if (cat === "dagang" && !filterDagang) return false;
       if (cat === "jasa" && !filterJasa) return false;
      if (cat === "produksi" && !filterProduksi) return false;
      if (cat === "lainnya" && !filterLainnya) return false;

      if (!q) return true;
      return (
        (p.umkmName ?? "").toLowerCase().includes(q) ||
        (p.owner ?? "").toLowerCase().includes(q) ||
        (p.jenisUsaha ?? "").toLowerCase().includes(q)
      );
    });
  }, [
    points,
    filterDagang,
    filterProduksi,
    filterJasa,
    filterLainnya,
    searchQuery,
  ]);

  // highlight selection or search-first match
  const highlightedId = useMemo(() => {
    if (!searchQuery) return null;
    const q = searchQuery.trim().toLowerCase();
    const found = filteredPoints.find(
      (p) =>
        (p.umkmName ?? "").toLowerCase().includes(q) ||
        (p.owner ?? "").toLowerCase().includes(q) ||
        (p.jenisUsaha ?? "").toLowerCase().includes(q)
    );
    return found?.id ?? null;
  }, [searchQuery, filteredPoints]);

  // geolocate
  const goToUserLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin lokasi dibutuhkan",
          "Ijinkan aplikasi mengakses lokasi untuk fitur ini."
        );
        setLocating(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      const { latitude, longitude } = pos.coords;
      setUserLocation({ latitude, longitude });
      const region: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current?.animateToRegion(region, 700);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Tidak dapat mengambil lokasi.");
    } finally {
      setLocating(false);
    }
  };

  // home (back to initial region)
  const goHome = () => {
    mapRef.current?.animateToRegion(initialRegion, 700);
  };

  // navigate to point
  const goToPoint = (p: UmkmPoint) => {
    if (p.latitude && p.longitude) {
      const region: Region = {
        latitude: p.latitude,
        longitude: p.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current?.animateToRegion(region, 700);
      setSelectedPoint(p);
      setSearchOpen(false); // Close search when navigating
      setSearchQuery(""); // Clear search query after selection
    }
  };

  // delete point
  const handleDeletePoint = async (id?: string, name?: string) => {
    if (!id) return;
    Alert.alert("Hapus lokasi", `Hapus ${name ?? "lokasi"}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await remove(ref(db, `umkm_points/${id}`));
            setSelectedPoint(null);
            Alert.alert("Sukses", "Lokasi berhasil dihapus.");
          } catch (e) {
            console.error(e);
            Alert.alert("Error", "Gagal menghapus lokasi.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loader,
          { backgroundColor: dark ? "#0B0B0B" : "#FFF7F6" },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={dark ? "#FFD966" : "#B00020"}
        />
        <Text style={{ marginTop: 8, color: dark ? "#EEE" : "#333" }}>
          Loading UMKM data...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion}>
        {filteredPoints.map((p) => {
          const isHighlighted =
            highlightedId === p.id || selectedPoint?.id === p.id;
          return (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.latitude!, longitude: p.longitude! }}
              onPress={() => setSelectedPoint(p)}
            >
              <Animated.View
                style={[
                  styles.markerWrap,
                  isHighlighted && styles.markerHighlighted,
                ]}
              >
                <Image
                  source={getIconForType(p.jenisUsaha)}
                  style={[
                    styles.markerImage,
                    isHighlighted && styles.markerImageLarge,
                  ]}
                />
              </Animated.View>
            </Marker>
          );
        })}

        {/* user location marker */}
        {userLocation && (
          <Marker coordinate={userLocation}>
            <View
              style={[
                styles.userDot,
                { backgroundColor: dark ? "#FFD966" : "#1E90FF" },
              ]}
            />
          </Marker>
        )}
      </MapView>

    {/* TOP RIGHT: Legend Icon Button with Collapsible Content */}
<Animated.View
    style={[
        styles.legendWrapper,
        {
            top: insets.top + 10,
            right: 128, // Posisi di kanan atas, dengan offset 128
            left: undefined, 
        },
    ]}
>
    {/* Tombol Utama: Kotak 48x48, Tanpa Border, Skema Warna Sesuai Permintaan */}
    <Pressable
        style={[
            styles.legendHeader,
            {
                // **HEADER STYLING**
                width: 48,
                height: 48,
                borderRadius: 12,
                
                // HAPUS BORDER
                borderColor: 'transparent', 
                borderWidth: 0, 
                
                // Warna Background/Dalam: Light (Putih), Dark (Item)
                backgroundColor: dark ? "#1E1E1E" : "#fff", 
                
                justifyContent: 'center', 
                alignItems: 'center',
            },
        ]}
        onPress={() => setLegendOpen((s) => !s)}
    >
        <FontAwesome
            // Warna Ikon (Luar): Merah di Light Mode, Kuning di Dark Mode
            name={legendOpen ? "times" : "list-ul"} 
            size={22}
            color={dark ? "#FFD966" : "#B00020"} // Kuning / Merah
        />
    </Pressable>

    {/* KONTEN LEGEND DIKEMBALIKAN */}
    {legendOpen && (
        <View
            style={[
                styles.legendCard,
                {
                    backgroundColor: dark ? "#222" : "#fff",
                    borderColor: dark ? "#333" : "#EEE",
                    marginTop: 5, 
                    // Posisikan Card di bawah dan sejajar dengan ikon utama di sebelah kanan
                    position: 'absolute', 
                    right: 15, 
                    top: 8, // Posisikan di bawah Header
                    minWidth: 150, 
                },
            ]}
        >
            {/* item Dagang */}
            <TouchableOpacity
                style={styles.legendItem}
                onPress={() => setFilterDagang((s) => !s)}
            >
                <Image
                    source={require("@/assets/images/dagang.png")}
                    style={styles.legendIcon}
                />
                <Text
                    style={[
                        styles.legendLabel,
                        { color: dark ? "#DDD" : "#333" },
                    ]}
                >
                    Barang
                </Text>
                <View style={{ flex: 1 }} />
                <FontAwesome
                    name={filterDagang ? "check-square" : "square-o"}
                    size={18}
                    color={
                        filterDagang
                            ? dark ? "#FFD966" : "#B00020"
                            : dark ? "#666" : "#AAA"
                    }
                    style={{ marginLeft: 8 }} 
                />
            </TouchableOpacity>

{/* Jasa */}
            <TouchableOpacity
                style={styles.legendItem}
                onPress={() => setFilterJasa((s) => !s)}
            >
                <Image
                    source={require("@/assets/images/jasa.png")}
                    style={styles.legendIcon}
                />
                <Text
                    style={[
                        styles.legendLabel,
                        { color: dark ? "#DDD" : "#333" },
                    ]}
                >
                    Jasa
                </Text>
                <View style={{ flex: 1 }} />
                <FontAwesome
                    name={filterJasa ? "check-square" : "square-o"}
                    size={18}
                    color={
                        filterJasa
                            ? dark ? "#FFD966" : "#B00020"
                            : dark ? "#666" : "#AAA"
                    }
                    style={{ marginLeft: 8 }} 
                />
            </TouchableOpacity>

            {/* Produksi */}
            <TouchableOpacity
                style={styles.legendItem}
                onPress={() => setFilterProduksi((s) => !s)}
            >
                <Image
                    source={require("@/assets/images/produksi.png")}
                    style={styles.legendIcon}
                />
                <Text
                    style={[
                        styles.legendLabel,
                        { color: dark ? "#DDD" : "#333" },
                    ]}
                >
                    Produksi
                </Text>
                <View style={{ flex: 1 }} />
                <FontAwesome
                    name={filterProduksi ? "check-square" : "square-o"}
                    size={18}
                    color={
                        filterProduksi
                            ? dark ? "#FFD966" : "#B00020"
                            : dark ? "#666" : "#AAA"
                    }
                    style={{ marginLeft: 8 }} 
                />
            </TouchableOpacity>

            

            {/* Lainnya */}
            <TouchableOpacity
                style={styles.legendItem}
                onPress={() => setFilterLainnya((s) => !s)}
            >
                <Image
                    source={require("@/assets/images/lainnya.png")}
                    style={styles.legendIcon}
                />
                <Text
                    style={[
                        styles.legendLabel,
                        { color: dark ? "#DDD" : "#333" },
                    ]}
                >
                    Lainnya
                </Text>
                <View style={{ flex: 1 }} />
                <FontAwesome
                    name={filterLainnya ? "check-square" : "square-o"}
                    size={18}
                    color={
                        filterLainnya
                            ? dark ? "#FFD966" : "#B00020"
                            : dark ? "#666" : "#AAA"
                    }
                    style={{ marginLeft: 8 }} 
                />
            </TouchableOpacity>
        </View>
    )}
</Animated.View>

      {/* TOP RIGHT: Search icon / collapsed input (New position) */}
      <View style={[styles.searchContainer, { top: insets.top + 10 }]}>
        {!searchOpen ? (
          <TouchableOpacity
            style={[
              styles.searchIconBtn,
              { backgroundColor: dark ? "#222" : "#fff" },
            ]}
            onPress={() => setSearchOpen(true)}
          >
            <MaterialIcons
              name="search"
              size={20}
              color={dark ? "#FFD966" : "#555"}
            />
          </TouchableOpacity>
        ) : (
          <View>
            <View
              style={[
                styles.searchBox,
                { backgroundColor: dark ? "#1A1A1A" : "#fff" },
              ]}
            >
              <MaterialIcons
                name="search"
                size={20}
                color={dark ? "#FFD966" : "#777"}
              />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Cari UMKM / pemilik / jenis..."
                placeholderTextColor={dark ? "#888" : "#999"}
                style={[
                  styles.searchInput,
                  { color: dark ? "#fff" : "#111" },
                ]}
                autoFocus
              />
              {searchQuery.length > 0 ? (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={styles.iconClear}
                >
                  <FontAwesome
                    name="times-circle"
                    size={18}
                    color={dark ? "#FFD966" : "#888"}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setSearchOpen(false)}
                  style={styles.iconClear}
                >
                  <Text
                    style={{
                      color: dark ? "#FFD966" : "#B00020",
                      fontWeight: "600",
                    }}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Search Results / FlatList */}
            {searchQuery.length > 0 && (
              <FlatList
                data={filteredPoints.slice(0, 5)} // Max 5 results
                keyExtractor={(item) => item.id}
                style={[
                  styles.searchResultsList,
                  {
                    backgroundColor: dark ? "#1A1A1A" : "#fff",
                    borderColor: dark ? "#333" : "#EEE",
                  },
                ]}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.searchResultItem,
                      { borderBottomColor: dark ? "#333" : "#EEE" },
                    ]}
                    onPress={() => goToPoint(item)}
                  >
                    <Image
                      source={getIconForType(item.jenisUsaha)}
                      style={styles.searchResultIcon}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.searchResultTitle,
                          { color: dark ? "#FFD966" : "#B00020" },
                        ]}
                        numberOfLines={1}
                      >
                        {item.umkmName}
                      </Text>
                      <Text
                        style={[
                          styles.searchResultSub,
                          { color: dark ? "#AAA" : "#666" },
                        ]}
                        numberOfLines={1}
                      >
                        {item.owner} ({item.jenisUsaha})
                      </Text>
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={20}
                      color={dark ? "#FFF" : "#555"}
                    />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text
                    style={[
                      styles.emptySearchResult,
                      { color: dark ? "#888" : "#999" },
                    ]}
                  >
                    Tidak ditemukan hasil.
                  </Text>
                }
              />
            )}
          </View>
        )}
      </View>

      {/* GEOLOCATE (left bottom) - Position maintained */}
      <TouchableOpacity
        style={[
          styles.geoBtn,
          {
            backgroundColor: dark ? "#FFD966" : "#B00020",
            left: 20,
            bottom: 76, // Adjusted to be above FAB and Home btn
          },
        ]}
        onPress={goToUserLocation}
      >
        {locating ? (
          <ActivityIndicator color={dark ? "#121212" : "#fff"} />
        ) : (
          <MaterialIcons
            name="my-location"
            size={22}
            color={dark ? "#121212" : "#fff"}
          />
        )}
      </TouchableOpacity>

      {/* HOME button (below geolocate) - Position maintained */}
      <TouchableOpacity
        style={[
          styles.homeBtn,
          {
            backgroundColor: dark ? "#FFD966" : "#B00020",
            left: 20, // Slightly more centered with FAB below it
            bottom: 130, // Adjusted to be above FAB
          },
        ]}
        onPress={goHome}
      >
        <FontAwesome name="home" size={20} color={dark ? "#121212" : "#fff"} />
      </TouchableOpacity>

      {/* ADD LOCATION FAB (New position: BOTTOM LEFT) */}
      <TouchableOpacity
        style={[
          styles.addFab,
          {
            backgroundColor: dark ? "#FFD966" : "#B00020",
            left: 16, // Align to left
            right: undefined, // Remove right alignment
            bottom: 15, // Use insets for bottom placement
          },
        ]}
        onPress={() => {
          if (!user || isGuest) {
            Alert.alert(
              "Akses terbatas",
              "Silakan login untuk menambah lokasi."
            );
            return;
          }
          router.push("/forminputlocation");
        }}
      >
        <FontAwesome name="plus" size={20} color={dark ? "#121212" : "#fff"} />
      </TouchableOpacity>

      {/* Modal detail professional (unchanged) */}
      <Modal
        visible={!!selectedPoint}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPoint(null)}
      >
        <Pressable
          style={styles.modalOverlay
            
          }
          onPress={() => setSelectedPoint(null)}
        >
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: dark ? "#121212" : "#fff" },
            ]}
            onPress={() => {}}
          >
            {selectedPoint?.photo ? (
              <Image
                source={{ uri: selectedPoint.photo }}
                style={styles.modalImage}
              />
            ) : (
              <View
                style={[
                  styles.modalImagePlaceholder,
                  { backgroundColor: dark ? "#2a2a2a" : "#e6e6e6" },
                ]}
              >
                <Text style={{ color: dark ? "#fff" : "#333" }}>
                  No Image
                </Text>
              </View>
            )}

            <View style={styles.modalBody}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: dark ? "#FFD966" : "#B00020" },
                ]}
              >
                {selectedPoint?.umkmName}
              </Text>
              <Text
                style={[styles.modalText, { color: dark ? "#DDD" : "#444" }]}
              >
                Pemilik: {selectedPoint?.owner ?? "-"}
              </Text>
              <Text
                style={[styles.modalText, { color: dark ? "#DDD" : "#444" }]}
              >
                Kontak: {selectedPoint?.contact ?? "-"}
              </Text>
              <Text
                style={[styles.modalText, { color: dark ? "#DDD" : "#444" }]}
              >
                Jenis: {selectedPoint?.jenisUsaha ?? "-"}
              </Text>
              <Text
                style={[
                  styles.modalTextSmall,
                  { color: dark ? "#AAA" : "#666", marginTop: 8 },
                ]}
              >
                Koordinat: {selectedPoint?.latitude},{" "}
                {selectedPoint?.longitude}
              </Text>

              <View style={styles.modalButtons}>
                {user && !isGuest ? (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.modalBtnPrimary,
                        { backgroundColor: dark ? "#FFD966" : "#B00020" },
                      ]}
                      onPress={() => {
                        const p = selectedPoint!;
                        setSelectedPoint(null);
                        router.push({
                          pathname: "/formeditlocation",
                          params: { ...p },
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.modalBtnText,
                          { color: dark ? "#121212" : "#fff" },
                        ]}
                      >
                        Edit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalBtnDanger]}
                      onPress={() =>
                        handleDeletePoint(
                          selectedPoint?.id,
                          selectedPoint?.umkmName
                        )
                      }
                    >
                      <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.modalBtnPrimary,
                      { backgroundColor: dark ? "#FFD966" : "#B00020" },
                    ]}
                    onPress={() => {
                      setSelectedPoint(null);
                      router.push("/login");
                    }}
                  >
                    <Text
                      style={[
                        styles.modalBtnText,
                        { color: dark ? "#121212" : "#fff" },
                      ]}
                    >
                      Login to Edit
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.modalBtnClose]}
                  onPress={() => setSelectedPoint(null)}
                >
                  <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/* -------------------- styles -------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  // markers
  markerWrap: { alignItems: "center", justifyContent: "center" },
  markerImage: { width: 34, height: 34 },
  markerImageLarge: { width: 44, height: 44 },
  markerHighlighted: { transform: [{ scale: 1.08 }] },

  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 4,
  },

  // search (New: TOP RIGHT)
  searchContainer: {
    position: "absolute",
    right: 12, // Align to right
    zIndex: 40,
    // Note: 'top' is set inline using insets for safe area consideration
  },
  searchIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "android" ? 6 : 8,
    borderRadius: 10,
    elevation: 6,
    width: 280,
    marginBottom: 8, // Space between input and results
  },
  searchInput: { marginLeft: 8, flex: 1, height: 36, fontSize: 14 },
  iconClear: { paddingHorizontal: 6 },

  // Search Results
  searchResultsList: {
    maxHeight: 200, // Limit height
    width: 280,
    borderRadius: 10,
    elevation: 5,
    borderWidth: 1,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  searchResultIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: "contain",
  },
  searchResultTitle: { fontSize: 14, fontWeight: "700" },
  searchResultSub: { fontSize: 12 },
  emptySearchResult: { padding: 10, textAlign: "center", fontSize: 14 },

  // legend (New: TOP LEFT, adjusted)
  legendWrapper: {
    position: "absolute",
    zIndex: 50,
    // Note: 'left' and 'top' are set inline using insets and fixed values
    width: Math.min(320, SCREEN_W * 0.6),
  },
  legendHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
  },
  legendTitle: { fontWeight: "700", marginLeft: 8 }, // Added margin to title
  legendCard: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  legendIcon: { width: 28, height: 28, marginRight: 10, resizeMode: "contain" },
  legendLabel: { fontSize: 14, fontWeight: "600" },

  // geolocate & home (Position maintained on LEFT)
  geoBtn: {
    position: "absolute",
    // Note: 'left' and 'bottom' are set inline for specific stacking
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  homeBtn: {
    position: "absolute",
    // Note: 'left' and 'bottom' are set inline for specific stacking
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },

  // add FAB (New: BOTTOM LEFT)
  addFab: {
    position: "absolute",
    // Note: 'left' and 'bottom' are set inline using insets
    width: 55,
    height: 55,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },

  // modal (unchanged)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center", // Memastikan kartu terpusat secara vertikal
    alignItems: "center",
    // HAPUS padding: 16 (jika masih ada)
  },
  modalCard: {
    // Gunakan Math.min(SCREEN_W - 40, 720) seperti sebelumnya
    width: Math.min(SCREEN_W - 40, 720),
    borderRadius: 14,
    overflow: "hidden",
    elevation: 12,
    
    // 💡 SOLUSI: Tambahkan Margin Vertikal yang lebih besar
    marginHorizontal: 20, 
    marginVertical: 60,
  },
  modalImage: { width: "100%", height: 200, resizeMode: "cover" },
  modalImagePlaceholder: {
    width: "100%",
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: { padding: 16 },
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  modalText: { fontSize: 15, marginBottom: 4 },
  modalTextSmall: { fontSize: 13 },

  modalButtons: { flexDirection: "row", marginTop: 12, flexWrap: "wrap" },
  modalBtnPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
  },
  modalBtnDanger: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
  },
  modalBtnClose: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#6c757d",
  },
  modalBtnText: { fontWeight: "700", color: "#fff" },
});