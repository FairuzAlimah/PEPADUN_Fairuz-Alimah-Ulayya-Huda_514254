import { Image } from "expo-image";
import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Platform,
  useColorScheme,
  Animated,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  Easing,
} from "react-native";
import { Entypo } from "@expo/vector-icons";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";

/* ================== ACCORDION ITEM ================== */
type AccordionItemProps = {
  index: number;
  title: React.ReactNode;
  isOpen: boolean;
  onPress: (index: number) => void;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
};

function AccordionItem({
  index,
  title,
  isOpen,
  onPress,
  children,
  containerStyle,
  backgroundColor = "#1A1A1A",
}: AccordionItemProps) {
  const anim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isOpen ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1],
  });

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <ThemedView style={[{ backgroundColor }, containerStyle]}>
      {/* HEADER */}
      <TouchableOpacity onPress={() => onPress(index)} activeOpacity={0.7}>
        <View style={[styles.collapseHeading, { backgroundColor }]}>
          {title}

          <Animated.View style={{ transform: [{ rotate }] }}>
            <Entypo name="chevron-down" size={20} color="gray" />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* CONTENT */}
      {isOpen && (
        <Animated.View
          style={[
            styles.collapseContent,
            {
              backgroundColor,
              opacity: anim,
              transform: [{ scale }],
            },
          ]}
        >
          {children}
        </Animated.View>
      )}
    </ThemedView>
  );
}

/* ================== MAIN SCREEN ================== */
export default function ExploreUMKMScreen() {
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  // WARNA
  const primaryColor = dark ? "#FFD966" : "#B00020";
  const secondaryColor = dark ? "#EAEAEA" : "#1A1A1A";

  const cardBackground = dark ? "#1A1A1A" : "#FFFFFF";
  const screenBackground = dark ? "#121212" : "#F8F8F8";

  return (
    <View style={{ flex: 1, backgroundColor: screenBackground }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "transparent", dark: "transparent" }}
        headerImage={
          <View style={styles.headerWrapper}>
            <Image
              source={require("@/assets/images/header.jpg")}
              style={styles.headerImage}
              contentFit="cover"
            />

            <View
              style={[
                styles.headerGradient,
                {
                  backgroundColor: dark
                    ? "rgba(0,0,0,0.65)"
                    : "rgba(0,0,0,0.4)",
                },
              ]}
            />

            <View style={styles.headerTitleContainer}>
              <ThemedText
                type="title"
                style={[
                  styles.headerTitle,
                  {
                    fontFamily: Fonts.rounded,
                    color: "#FFD966",
                    lineHeight: 34, // Coba nilai yang lebih besar dari fontSize Anda.
                    paddingBottom: 2,
                  },
                ]}
              >
                Kategori UMKM
              </ThemedText>

              <ThemedText
                style={[
                  styles.headerSubtitle,
                  { color: "white", opacity: 0.9 },
                ]}
              >
                Eksplorasi kategori UMKM di Bandar Lampung
              </ThemedText>
            </View>
          </View>
        }
      >
        {/* INTRO */}
        <ThemedText
          style={[
            styles.sectionIntro,
            {
              color: primaryColor,
              fontWeight: "600",
            },
          ]}
        >
          Jelajahi beragam kategori UMKM yang berkembang di Kota Bandar Lampung.
        </ThemedText>
        {/* ================= BARANG ================= */}
        <ThemedView
          style={[styles.cardContainer, { backgroundColor: cardBackground }]}
        >
          <AccordionItem
            index={2}
            isOpen={openIndex === 2}
            onPress={handleToggle}
            backgroundColor={cardBackground}
            title={
              <View style={styles.row}>
                <Image
                  source={require("@/assets/images/dagang.png")}
                  style={styles.categoryIcon}
                  contentFit="contain"
                />
                <ThemedText
                  style={[styles.collapseTitleText, { color: primaryColor }]}
                >
                  Barang
                </ThemedText>
              </View>
            }
          >
            <ThemedText
              style={[styles.collapseText, { color: secondaryColor }]}
            >
              Fokus pada perdagangan seperti kuliner, fesyen, toko kelontong,
              serta penjualan online. Letak strategis kota mendorong UMKM dagang
              bertumbuh cepat dan kompetitif.
            </ThemedText>
          </AccordionItem>
        </ThemedView>
        {/* ================= JASA ================= */}
        <ThemedView
          style={[styles.cardContainer, { backgroundColor: cardBackground }]}
        >
          <AccordionItem
            index={1}
            isOpen={openIndex === 1}
            onPress={handleToggle}
            backgroundColor={cardBackground}
            title={
              <View style={styles.row}>
                <Image
                  source={require("@/assets/images/jasa.png")}
                  style={styles.categoryIcon}
                  contentFit="contain"
                />
                <ThemedText
                  style={[styles.collapseTitleText, { color: primaryColor }]}
                >
                  Jasa
                </ThemedText>
              </View>
            }
          >
            <ThemedText
              style={[styles.collapseText, { color: secondaryColor }]}
            >
              Sektor jasa meliputi kecantikan, bengkel, laundry, katering,
              desain grafis, serta layanan digital. Sektor ini menjadi tulang
              punggung pelayanan kebutuhan masyarakat perkotaan.
            </ThemedText>
          </AccordionItem>
        </ThemedView>
        {/* ================= PRODUKSI ================= */}
        <ThemedView
          style={[styles.cardContainer, { backgroundColor: cardBackground }]}
        >
          <AccordionItem
            index={0}
            isOpen={openIndex === 0}
            onPress={handleToggle}
            backgroundColor={cardBackground}
            title={
              <View style={styles.row}>
                <Image
                  source={require("@/assets/images/produksi.png")}
                  style={styles.categoryIcon}
                  contentFit="contain"
                />
                <ThemedText
                  style={[styles.collapseTitleText, { color: primaryColor }]}
                >
                  Produksi
                </ThemedText>
              </View>
            }
          >
            <ThemedText
              style={[styles.collapseText, { color: secondaryColor }]}
            >
              UMKM produksi di Bandar Lampung berkembang di sektor makanan,
              kerajinan, fesyen, dan hasil pertanian. Produk seperti kopi
              Lampung, keripik pisang, hingga tapis menjadi ikon ekonomi yang
              memperkuat potensi lokal.
            </ThemedText>
          </AccordionItem>
        </ThemedView>

        {/* ================= LAINNYA ================= */}
        <ThemedView
          style={[styles.cardContainer, { backgroundColor: cardBackground }]}
        >
          <AccordionItem
            index={3}
            isOpen={openIndex === 3}
            onPress={handleToggle}
            backgroundColor={cardBackground}
            title={
              <View style={styles.row}>
                <Image
                  source={require("@/assets/images/lainnya.png")}
                  style={styles.categoryIcon}
                  contentFit="contain"
                />
                <ThemedText
                  style={[styles.collapseTitleText, { color: primaryColor }]}
                >
                  Lainnya
                </ThemedText>
              </View>
            }
          >
            <ThemedText
              style={[styles.collapseText, { color: secondaryColor }]}
            >
              Meliputi sektor kreatif, edukasi, pertanian modern, dan industri
              rumah tangga. Menciptakan ekosistem UMKM yang inklusif serta
              berkelanjutan.
            </ThemedText>
          </AccordionItem>
        </ThemedView>
      </ParallaxScrollView>
    </View>
  );
}

/* ================== STYLES ================== */
const styles = StyleSheet.create({
  headerWrapper: {
    width: "100%",
    height: 200,
    overflow: "hidden",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerTitleContainer: {
    position: "absolute",
    bottom: 26,
    left: 18,
    right: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },

  sectionIntro: {
    marginBottom: 10,
    marginTop: 6,
    fontSize: 16,
    lineHeight: 24,
  },

  cardContainer: {
    borderRadius: 16,
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  collapseHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },

  collapseContent: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  collapseTitleText: {
    fontSize: 18,
    fontWeight: "700",
  },

  categoryIcon: {
    width: 36,
    height: 36,
  },

  collapseText: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.95,
  },
});
