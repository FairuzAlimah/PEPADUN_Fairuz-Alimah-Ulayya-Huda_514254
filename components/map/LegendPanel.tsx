import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";

export default function LegendPanel({ onFilterChange }: any) {
  const [open, setOpen] = useState(true);

  const offset = useSharedValue(0);

  const toggle = () => {
    setOpen(!open);
    offset.value = withTiming(open ? 140 : 0, { duration: 300 });
  };

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <Animated.View style={[styles.container, slideStyle]}>
      {/* HEADER */}
      <TouchableOpacity onPress={toggle} style={styles.header}>
        <Text style={styles.title}>Legend</Text>
        <Text style={styles.arrow}>{open ? "▼" : "▲"}</Text>
      </TouchableOpacity>

      {/* CONTENT */}
      {open && (
        <View style={{ marginTop: 10 }}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => onFilterChange(["Produksi"])}
          >
            <View style={[styles.colorBox, { backgroundColor: "#E57373" }]} />
            <Text>Produksi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => onFilterChange(["Jasa"])}
          >
            <View style={[styles.colorBox, { backgroundColor: "#64B5F6" }]} />
            <Text>Jasa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => onFilterChange(["Dagang"])}
          >
            <View style={[styles.colorBox, { backgroundColor: "#81C784" }]} />
            <Text>Dagang</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => onFilterChange([])}>
            <View style={[styles.colorBox, { backgroundColor: "gray" }]} />
            <Text>Semua</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    right: 16,
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    elevation: 5,
    width: 160,
    zIndex: 999,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: { fontWeight: "bold" },
  arrow: { fontSize: 13 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  colorBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginRight: 8,
  },
});
