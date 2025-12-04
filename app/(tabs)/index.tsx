/* CHART BAR + ANIMASI + CLICK + DARK MODE + SUMMARY CARDS 1 ROW */

import { db, onAuthChange } from "@/lib/firebase";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState, useRef } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
  Animated,
  Pressable,
  useColorScheme,
} from "react-native";

/* ====== TAMBAHKAN TYPE INI ====== */
type CategoryKey = "barang" | "jasa" | "produksi" | "lainnya";

export default function IndexScreen() {
  const colorScheme = useColorScheme();
  const dark = colorScheme === "dark";
  const screenWidth = Dimensions.get("window").width;

  const [counts, setCounts] = useState<Record<CategoryKey, number>>({
    barang: 0,
    jasa: 0,
    produksi: 0,
    lainnya: 0,
  });

  const [selectedJenis, setSelectedJenis] = useState<CategoryKey | null>(null);

  const items: { key: CategoryKey; label: string; color: string }[] = [
    {
      key: "barang",
      label: "Barang",
      color: dark ? "#FFD700" : "#a81111ff",
    },
    {
      key: "jasa",
      label: "Jasa",
      color: dark ? "#FFB74D" : "#e71212ff",
    },
    {
      key: "produksi",
      label: "Produksi",
      color: dark ? "#FFCC80" : "#e32929ff",
    },
    {
      key: "lainnya",
      label: "Lainnya",
      color: dark ? "#FFE0B2" : "#9b0a0aff",
    },
  ];

  /* ====== BAR ANIMATION FIX ====== */
  const barAnim: Record<CategoryKey, Animated.Value> = {
    barang: useRef(new Animated.Value(0)).current,
    jasa: useRef(new Animated.Value(0)).current,
    produksi: useRef(new Animated.Value(0)).current,
    lainnya: useRef(new Animated.Value(0)).current,
  };

  useEffect(() => {
    onAuthChange(() => {});

    const dataRef = ref(db, "umkm_points/");
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      let barang = 0,
        jasa = 0,
        produksi = 0,
        lainnya = 0;

      Object.values(data).forEach((item: any) => {
        const jenis = (item?.jenisUsaha ?? "")
          .toString()
          .toLowerCase()
          .trim();

        if (jenis === "barang") barang++;
        else if (jenis === "jasa") jasa++;
        else if (jenis === "produksi") produksi++;
        else lainnya++;
      });

      const newCounts: Record<CategoryKey, number> = {
        barang,
        jasa,
        produksi,
        lainnya,
      };

      setCounts(newCounts);

      (Object.keys(newCounts) as CategoryKey[]).forEach((key) => {
        Animated.timing(barAnim[key], {
          toValue: newCounts[key],
          duration: 900,
          useNativeDriver: false,
        }).start();
      });
    });
  }, []);

  const total =
    counts.barang + counts.jasa + counts.produksi + counts.lainnya;

  const chartHeight = Math.round(Dimensions.get("window").height * 0.3);
  const maxVal = Math.max(1, ...Object.values(counts));
  const maxBarHeight = chartHeight - 80;
  const barWidth = Math.min(55, Math.round((screenWidth - 90) / items.length));

  return (
    <View style={{ flex: 1, backgroundColor: dark ? "#121212" : "#FFF7F6" }}>
      {/* HEADER */}
      <View
        style={[
          styles.appHeader,
          { backgroundColor: dark ? "#8B0000" : "#B00020" },
        ]}
      >
        <View style={styles.headerTextWrap}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
          />
          <View>
            <Text style={styles.appTitle}>PEPADUN</Text>
            <Text style={styles.tagline}>Sai Bumi, Sai Data UMKM</Text>
            <Text style={styles.platformText}>
              Platform Ekonomi Pelaku Usaha Daerah {"\n"}— Bandar Lampung
            </Text>
          </View>
        </View>
      </View>

      {/* TITLE */}
      <View style={styles.rowTop}>
        <Text style={[styles.title, { color: dark ? "#FFD966" : "#B00020" }]}>
          Dashboard Jenis Usaha UMKM
        </Text>
      </View>

      {/* SUMMARY CARDS */}
      <View style={styles.summaryRow}>
        {items.map((it) => (
          <View
            key={it.key}
            style={[
              styles.summaryCard,
              { backgroundColor: dark ? "#1E1E1E" : "#FFFFFF" },
            ]}
          >
            <Text
              style={[
                styles.summaryLabel,
                { color: dark ? "#FFD966" : "#B00020" },
              ]}
            >
              {it.label}
            </Text>

            {/* ✅ ERROR FIX DISINI */}
            <Text
              style={[
                styles.summaryValue,
                { color: dark ? "#fff" : "#333" },
              ]}
            >
              {counts[it.key]}
            </Text>
          </View>
        ))}
      </View>

      {/* CHART */}
      <View
        style={[
          styles.chartBox,
          { backgroundColor: dark ? "#1E1E1E" : "#fff" },
        ]}
      >
        <Text
          style={[styles.chartTitle, { color: dark ? "#FFD966" : "#B00020" }]}
        >
          Distribusi Jenis Usaha
        </Text>

        <View style={[styles.chartRow, { height: chartHeight }]}>
          {items.map((it) => {
            const animatedHeight = barAnim[it.key].interpolate({
              inputRange: [0, maxVal],
              outputRange: [20, maxBarHeight],
              extrapolate: "clamp",
            });

            const percent = Math.round((counts[it.key] / total) * 100 || 0);

            return (
              <Pressable
                key={it.key}
                onPress={() =>
                  setSelectedJenis((p) => (p === it.key ? null : it.key))
                }
                style={[styles.barItem, { width: barWidth }]}
              >
                <Animated.View
                  style={{
                    height: animatedHeight,
                    width: "60%",
                    backgroundColor: it.color,
                    opacity: selectedJenis === it.key ? 1 : 0.85,
                    borderRadius: 8,
                  }}
                />

                <Text
                  style={[
                    styles.barLabel,
                    { color: dark ? "#eee" : "#666" },
                  ]}
                >
                  {it.label}
                </Text>

                {/* ✅ ERROR FIX DISINI JUGA */}
                <Text
                  style={[
                    styles.barValue,
                    { color: dark ? "#fff" : "#333" },
                  ]}
                >
                  {counts[it.key]}
                </Text>

                {selectedJenis === it.key && (
                  <Text style={[styles.barPercent, { color: dark ? "#FFD966" : "#B00020"  }]}>
                    {percent}%
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.legendRow}>
          <Text style={[styles.legendText, { color: dark ? "#fff" : "#444" }]}>
            Total Titik UMKM: {total}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appHeader: {
    paddingVertical: 22,
    paddingHorizontal: 16,
    paddingTop: 36,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
  },

  headerTextWrap: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: { width: 70, height: 75, marginRight: 6 },
  appTitle: { fontSize: 24, fontWeight: "800", color: "#FFD700" },
  tagline: { fontSize: 14, color: "#FFD700" },

  platformText: {
    fontSize: 13,
    marginTop: 6,
    color: "#FFEAEA",
    fontStyle: "italic",
    lineHeight: 18,
  },

  rowTop: { marginTop: 20, paddingHorizontal: 16 },
  title: { fontSize: 20, fontWeight: "700" },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 18,
  },

  summaryCard: {
    width: "23%",
    paddingVertical: 16,
    borderRadius: 14,
    elevation: 3,
    alignItems: "center",
  },

  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },

  chartBox: {
    marginTop: 20,
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    flex: 1,
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  chartRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },

  barItem: { alignItems: "center" },
  barLabel: { fontSize: 11, marginTop: 6 },
  barValue: { fontSize: 14, fontWeight: "700", marginTop: 3 },
  barPercent: { fontSize: 12, fontWeight: "700", marginTop: 2 },

  legendRow: { marginTop: 10, alignItems: "center" },
  legendText: { fontSize: 16, fontWeight: "600" },
});
