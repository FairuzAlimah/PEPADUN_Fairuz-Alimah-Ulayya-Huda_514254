import { useAuth } from '@/hooks/use-auth';
import { useGuest } from '@/hooks/use-guest';
import { db, signOut } from '@/lib/firebase';
import { useRouter } from 'expo-router';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ---------------- THEME COLORS ----------------
const COLORS = (mode: string) => ({
  background: mode === "dark" ? "#121212" : "#FDF2F2",
  text: mode === "dark" ? "#FFFFFF" : "#2C2C2C",
  textSecondary: mode === "dark" ? "#DDDDDD" : "#A0A0A0",
  primary: mode === "dark" ? "#FFD966" : "#8E0A0A", // Mirip dengan primary di file lain
  cardBG: mode === "dark" ? "#1E1E1E" : "#FFFFFF",
  buttonBG: mode === "dark" ? "#8E0A0A" : "#8E0A0A", // Tetap mirip, tapi bisa disesuaikan
  buttonText: mode === "dark" ? "#FFD966" : "#FFD966",
  loginButtonBG: mode === "dark" ? "#FFD966" : "#B21F1F",
  loginButtonText: mode === "dark" ? "#B21F1F" : "#FFE9A6",
});

export default function ProfileScreen() {
  const mode = useColorScheme() ?? "light";
  const C = COLORS(mode);

  const { user } = useAuth();
  const { isGuest, setGuest } = useGuest();
  const router = useRouter();
  const [profile, setProfile] = useState<{ name?: string | null; email?: string | null } | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    const usersRef = ref(db, `users/${user.uid}`);
    const unsub = onValue(usersRef, (snap) => {
      const data = snap.val();
      if (data) {
        setProfile({
          name: data.name ?? user.displayName ?? '',
          email: data.email ?? user.email ?? '',
        });
      } else {
        setProfile({
          name: user.displayName ?? '',
          email: user.email ?? '',
        });
      }
    });
    return () => unsub();
  }, [user]);

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      {/* ICON PROFIL */}
      <View style={styles.iconWrapper}>
        <Ionicons name="person-circle-outline" size={110} color={C.primary} />
      </View>

      <Text style={[styles.title, { color: C.primary }]}>Profil Pengguna</Text>

      {/* CARD */}
      <View style={[styles.card, { backgroundColor: C.cardBG }]}>
        <Text style={[styles.label, { color: C.textSecondary }]}>Nama</Text>
        <Text style={[styles.value, { color: C.text }]}>{profile?.name || user?.displayName || '-'}</Text>

        <Text style={[styles.label, { color: C.textSecondary }]}>Email</Text>
        <Text style={[styles.value, { color: C.text }]}>{profile?.email || user?.email || '-'}</Text>
      </View>

      {/* BUTTON */}
      {user && !isGuest ? (
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: C.buttonBG }]}
          onPress={() => {
            setGuest(false);
            signOut();
          }}
        >
          <Text style={[styles.logoutText, { color: C.buttonText }]}>Logout</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.loginBtn, { backgroundColor: C.loginButtonBG }]} onPress={() => router.push('/login')}>
          <Text style={[styles.loginText, { color: C.loginButtonText }]}>Login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40, // ⬅️ TURUNKAN PADDING ATAS
    alignItems: 'center',
  },

  iconWrapper: {
    marginBottom: 10, // jarak icon ke title
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 22, // jarak title ke card sedikit dikecilkan
    letterSpacing: 0.5,
  },

  card: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#D34A4A',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  label: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 10,
  },

  value: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 2,
  },

  logoutBtn: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
    elevation: 3,
  },

  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  loginBtn: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
    elevation: 3,
  },

  loginText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
