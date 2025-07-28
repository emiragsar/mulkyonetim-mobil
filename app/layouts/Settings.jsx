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
import ButtonLayout from "../input/ButtonLayout";

export default function Settings() {
  const handleItemPress = (itemName) => {
    router.push(itemName);
  };

  const handleLogout = () => {
    console.log("Settings'ten çıkış yap butonuna basıldı");
    Alert.alert("Çıkış Yap", "Çıkış yapmak istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        onPress: () => {
          console.log("Settings'ten çıkış işlemi başlatılıyor...");
          // Basit logout - ana sayfaya yönlendir
          router.replace("/(screens)/Login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* GENEL AYARLAR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENEL AYARLAR</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              onPress={() => handleItemPress("/(setting)/LanguageSettings")}
              style={styles.settingItem}
            >
              <Text style={styles.settingText}>Dil</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleItemPress("/(setting)/ContactSettings")}
              style={[styles.settingItem, styles.lastItem]}
            >
              <Text style={styles.settingText}>İletişim Ayarları</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* PROFİL AYARLARI */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFİL AYARLARI</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                handleItemPress("/(setting)/(profile)/PersonalInfoScreen")
              }
            >
              <Text style={styles.settingText}>Kişisel Bilgiler</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleItemPress("/(setting)/(profile)/MySites")}
              style={styles.settingItem}
            >
              <Text style={styles.settingText}>Sitelerim</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                handleItemPress("/(setting)/(profile)/MyApartments")
              }
              style={styles.settingItem}
            >
              <Text style={styles.settingText}>Dairelerim</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                handleItemPress("/(setting)/(profile)/CardsAndOrders")
              }
              style={styles.settingItem}
            >
              <Text style={styles.settingText}>Kartlarım ve Talimatlarım</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                handleItemPress("/(setting)/(profile)/ChangePassword")
              }
              style={[styles.settingItem, styles.lastItem]}
            >
              <Text style={styles.settingText}>Şifre Değiştir</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* DİĞER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DİĞER</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              onPress={() => handleItemPress("/(setting)/(other)/Feedback")}
              style={[styles.settingItem, styles.lastItem]}
            >
              <Text style={styles.settingText}>Geri Bildirim</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* YASAL METİNLER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YASAL METİNLER</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                handleItemPress("/(setting)/(legal)/UserAgreement")
              }
            >
              <Text style={styles.settingText}>Kullanıcı Sözleşmesi</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleItemPress("/(setting)/(legal)/kvkk")}
            >
              <Text style={styles.settingText}>KVKK Aydınlatma Metni</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.settingItem, styles.lastItem]}
              onPress={() =>
                handleItemPress("/(setting)/(legal)/PrivacyAgreement")
              }
            >
              <Text style={styles.settingText}>Gizlilik Sözleşmesi</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <ButtonLayout
            onClick={handleLogout}
            ButtonText="Çıkış Yap"
            color1="#e74c3c"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionContent: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingText: {
    fontSize: 16,
    color: "#333",
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
});
