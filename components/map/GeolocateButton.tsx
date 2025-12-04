import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { FontAwesome } from "@expo/vector-icons";

export default function GeolocateButton({ mapRef }: any) {
  const locateUser = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Izin lokasi ditolak");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      800
    );
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={locateUser}>
      <FontAwesome name="location-arrow" size={20} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    bottom: 100,
    right: 16,
    width: 50,
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});
