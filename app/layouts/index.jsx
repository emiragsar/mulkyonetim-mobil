import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Footer from "../components/footer/index";

const API_BASE_URL = "http://192.168.1.107:8000";

const DashboardCard = ({ title, value, icon, color, onPress, loading }) => (
  <TouchableOpacity
    style={[styles.card, { borderLeftColor: color }]}
    onPress={onPress}
  >
    <View style={styles.cardContent}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardTitle}>{title}</Text>
        {loading ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <Text style={styles.cardValue}>{value}</Text>
        )}
      </View>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#ffffff" />
      </View>
    </View>
  </TouchableOpacity>
);

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/dashboard-metrics`);
      const data = response.data;

      // Backend'den gelen verileri dashboard kartlarına map et
      const mappedData = [
        {
          title: "Toplam Portföy",
          value: data.toplam_portfoy?.toString() || "0",
          icon: "home",
          color: "#3498db",
        },
        {
          title: "Toplam Kullanıcı",
          value: data.toplam_kullanici?.toString() || "0",
          icon: "people",
          color: "#2ecc71",
        },
        {
          title: "Aylık Gelir",
          value: data.aylik_gelir
            ? `${data.aylik_gelir.toLocaleString("tr-TR")} ₺`
            : "0 ₺",
          icon: "cash",
          color: "#f39c12",
        },

        {
          title: "Kiralık Portföy",
          value: data.kiralamaya_hazir_daire?.toString() || "0",
          icon: "key",
          color: "#16a085",
        },
      ];

      setDashboardData(mappedData);
      setError("");
    } catch (err) {
      let errorMessage = "Dashboard verileri yüklenirken hata oluştu";

      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.request) {
        errorMessage =
          "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
      } else {
        errorMessage = "Beklenmeyen bir hata oluştu: " + err.message;
      }

      setError(errorMessage);
      Alert.alert("Hata", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const handleCardPress = (cardTitle) => {
    console.log(`${cardTitle} pressed`);
    // Burada kartlara özel navigation veya detay sayfalarına yönlendirme yapabilirsiniz
  };

  const handleRefresh = () => {
    fetchDashboardMetrics();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header with refresh button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={loading}
          >
            <Ionicons
              name="refresh"
              size={24}
              color={loading ? "#bdc3c7" : "#3498db"}
            />
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRefresh}
            >
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Dashboard Cards */}
        <View style={styles.cardGrid}>
          {dashboardData.map((item, index) => (
            <DashboardCard
              key={index}
              title={item.title}
              value={item.value}
              icon={item.icon}
              color={item.color}
              loading={loading}
              onPress={() => handleCardPress(item.title)}
            />
          ))}
        </View>

        {/* Loading state for initial load */}
        {loading && dashboardData.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
          </View>
        )}

        <Footer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#ecf0f1",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#F44336",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  retryButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#7f8c8d",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    width: "48%",
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});
