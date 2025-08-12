import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";

const { width, height } = Dimensions.get("window");

const Unauthorized = ({ title = "Yetkisiz Erişim" }) => {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Çift tıklamayı engelle

    setIsLoggingOut(true);

    try {
      console.log("Logout button pressed");

      // AuthContext logout işlemini dene
      await logout();
      console.log("AuthContext logout successful");

      // Ek güvenlik için AsyncStorage'ı da temizle
      await AsyncStorage.multiRemove(["user", "sessionToken"]);
      console.log("AsyncStorage cleared");

      // Login sayfasına yönlendir
      router.replace("/authentication/Login");
      console.log("Redirected to login");
    } catch (error) {
      console.error("Logout error:", error);

      // Hata durumunda direkt AsyncStorage'ı temizle ve yönlendir
      try {
        await AsyncStorage.multiRemove(["user", "sessionToken"]);
        console.log("Force cleared AsyncStorage");
      } catch (storageError) {
        console.error("AsyncStorage clear error:", storageError);
      }

      router.replace("/authentication/Login");
      console.log("Force redirected to login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Navigation bar - keeping the existing navigation */}
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>{title}</Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-outline" size={100} color="#e74c3c" />
        </View>

        <Text style={styles.mainTitle}>Erişim Engellendi</Text>

        <Text style={styles.message}>
          Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.
        </Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Mevcut Kullanıcı:</Text>
          <Text style={styles.infoText}>
            {user?.Ad || user?.name || "Bilinmiyor"}{" "}
            {user?.Soyad || user?.surname || ""}
          </Text>
          <Text style={styles.infoLabel}>Rol:</Text>
          <Text style={styles.infoText}>
            {user?.rol || user?.role || "Tanımsız"}
          </Text>
        </View>

        <Text style={styles.subMessage}>
          Bu sayfaya erişim için admin yetkilerine sahip olmanız gerekmektedir.
        </Text>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            isLoggingOut && styles.logoutButtonDisabled,
          ]}
          onPress={handleLogout}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={isLoggingOut}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>
            {isLoggingOut ? "Çıkış Yapılıyor..." : "Çıkış Yap"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  navbar: {
    backgroundColor: "#3498db",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 30,
    backgroundColor: "#fff",
    borderRadius: 80,
    padding: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
  },
  message: {
    fontSize: 18,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "600",
    lineHeight: 26,
  },
  infoContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    minWidth: width * 0.8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  subMessage: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e74c3c",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    minWidth: 150,
    minHeight: 50,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  logoutButtonDisabled: {
    backgroundColor: "#95a5a6",
    opacity: 0.7,
  },
});

export default Unauthorized;
