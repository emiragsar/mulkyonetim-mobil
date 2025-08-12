import DashboardLayout from "@/app/components/dashboardlayout";
import DataTable from "@/app/components/tables";
import API_BASE_URL from "@/config/api";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const Ustalar = () => {
  const [allUstalarData, setAllUstalarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUstalar();
  }, []);

  const fetchUstalar = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_BASE_URL}/usta`);
      const data = response.data;

      // Format data to match component structure
      const formattedData = data.map((item) => ({
        id: item.id,
        adSoyad: item["Ad-Soyad"] || "İsim Yok",
        isletme: item.Isletme || "Belirtilmemiş",
        alan: item.Alan || "Belirtilmemiş",
        skor: item.Usta_Skor !== null ? item.Usta_Skor : "N/A",
        adres: item.Adres || "Belirtilmemiş",
        mail: item.Mail || "Belirtilmemiş",
      }));

      setAllUstalarData(formattedData);
    } catch (err) {
      let errorMessage = "Usta listesi yüklenirken hata oluştu";

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

  const handleRefresh = () => {
    fetchUstalar();
  };

  const getSkorColor = (skor) => {
    if (skor === "N/A") return "#666"; // Gri
    if (skor <= 2) return "#F44336"; // error - kırmızı
    if (skor <= 3) return "#FF9800"; // warning - turuncu
    if (skor <= 4) return "#2196F3"; // info - mavi
    return "#4CAF50"; // success - yeşil
  };

  // DataTable için kolonları tanımlıyoruz
  const columns = [
    {
      Header: "AD-SOYAD",
      accessor: "adSoyad",
      flex: 2.5,
      align: "left",
      Cell: ({ value }) => (
        <Text style={styles.nameCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "İŞLETME",
      accessor: "isletme",
      flex: 2,
      align: "left",
      Cell: ({ value }) => (
        <Text style={styles.tableCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "ALAN",
      accessor: "alan",
      flex: 2,
      align: "left",
      Cell: ({ value }) => (
        <Text style={styles.tableCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "ADRES",
      accessor: "adres",
      flex: 3,
      align: "left",
      Cell: ({ value }) => (
        <Text style={styles.addressCell} numberOfLines={3}>
          {value}
        </Text>
      ),
    },
    {
      Header: "MAİL",
      accessor: "mail",
      flex: 2.5,
      align: "left",
      Cell: ({ value }) => (
        <Text style={styles.tableCellSmall} numberOfLines={2}>
          {value}
        </Text>
      ),
    },

    {
      Header: "SKOR",
      accessor: "skor",
      flex: 1,
      align: "center",
      Cell: ({ value }) => (
        <Text
          style={[styles.skorCell, { color: getSkorColor(value) }]}
          numberOfLines={1}
        >
          {value}
        </Text>
      ),
    },
  ];

  // DataTable için veri yapısını hazırlıyoruz
  const tableData = {
    columns,
    rows: allUstalarData,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
        </View>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.blueHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Ustalar</Text>
            </View>
          </View>

          {/* DataTable */}
          <DataTable
            table={tableData}
            entriesPerPage={{
              defaultValue: 10,
              entries: [5, 10, 25, 50],
            }}
            canSearch={true}
            showTotalEntries={true}
            isSorted={true}
            noEndBorder={false}
            pagination={{
              variant: "gradient",
              color: "info",
            }}
          />
        </View>
      </View>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerSection: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  blueHeader: {
    backgroundColor: "#3498db",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 15,
    borderRadius: 8,
    margin: 16,
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
  // Cell styles for DataTable
  nameCell: {
    fontSize: 10,
    color: "#333",
    fontWeight: "600", // medium font weight
  },
  tableCell: {
    fontSize: 9,
    color: "#666", // text color
  },
  tableCellSmall: {
    fontSize: 9,
    color: "#666",
  },
  addressCell: {
    fontSize: 9,
    color: "#666",
  },
  skorCell: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default Ustalar;
