import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PersonalInfos() {
  // Basit user data - gerçek API'den gelecek
  const currentUser = {
    name: "Test Kullanıcı",
    email: "test@example.com",
    phone: "0532 123 45 67",
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Hesabımı Sil",
      "Hesabınızı silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Sil", style: "destructive" },
      ]
    );
  };

  const handleLogout = () => {
    console.log("Çıkış yap butonuna basıldı");
    Alert.alert("Çıkış Yap", "Çıkış yapmak istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        onPress: () => {
          console.log("Çıkış işlemi başlatılıyor...");
          router.replace("/(screens)/Login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kişisel Bilgiler</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{currentUser?.avatar || "U"}</Text>
          </View>
          <TouchableOpacity style={styles.editIcon}>
            <Ionicons name="pencil" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          {/* Name */}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ad Soyad</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {currentUser?.name || "Belirtilmemiş"}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Telefon</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {currentUser?.phone || "Belirtilmemiş"}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </View>

          {/* Email */}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>E-Posta</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {currentUser?.email || "Belirtilmemiş"}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </View>

          {/* Site */}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Site</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {currentUser?.site || "Belirtilmemiş"}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </View>

          {/* Apartment */}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Daire</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {currentUser?.apartment || "Belirtilmemiş"}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </View>
        </View>

        {/* Delete Account Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          <Text style={styles.deleteText}>Hesabımı Sil</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    paddingTop: 30,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#666",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  infoContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 0,
  },
  infoItem: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    paddingVertical: 15,
  },
  deleteText: {
    fontSize: 16,
    color: "#FF6B6B",
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: "#00A8E8",
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
