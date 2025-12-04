import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function SearchPanel({ data, onResultPress }: any) {
  const [query, setQuery] = useState("");

  const filtered = data.filter((item: any) =>
    item.umkmName?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* SEARCH INPUT BOX */}
      <View style={styles.searchBox}>
        <FontAwesome name="search" size={16} color="#777" />
        <TextInput
          placeholder="Cari UMKM..."
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
      </View>

      {/* RESULT LIST */}
      {query.length > 0 && (
        <View style={styles.resultBox}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onResultPress(item);
                  setQuery("");
                }}
                style={styles.resultItem}
              >
                <Text style={styles.resultText}>{item.umkmName}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 90,        // ⬅️ POSISI DITURUNKAN (lebih nyaman)
    left: "auto",
    right: 16,
    zIndex: 999,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 4,
  },

  input: {
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
  },

  resultBox: {
    backgroundColor: "#fff",
    marginTop: 6,
    borderRadius: 10,
    elevation: 4,
    maxHeight: 220,
    overflow: "hidden",
  },

  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ececec",
  },

  resultText: {
    fontSize: 15,
  },
});
