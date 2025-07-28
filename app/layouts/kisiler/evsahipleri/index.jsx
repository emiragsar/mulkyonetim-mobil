import DashboardLayout from "@/app/components/dashboardlayout";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import API_BASE_URL from "../../../../config/api";

const EvSahipleri = () => {
  const [selectedRows, setSelectedRows] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allOwnersData, setAllOwnersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerDetails, setOwnerDetails] = useState([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchEvSahipleri();
  }, []);

  const fetchEvSahipleri = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_BASE_URL}/ev_sahibi`);
      const data = response.data;

      // Format data to match component structure
      const formattedData = data.map((item) => ({
        id: item.id,
        name: item["Ad-Soyad"],
        phone: item.Telefon || "Belirtilmemiş",
        email: item.Mail || "Belirtilmemiş",
        address: item.Adres || "Belirtilmemiş",
      }));

      setAllOwnersData(formattedData);
    } catch (err) {
      let errorMessage = "Ev sahipleri listesi yüklenirken hata oluştu";

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

  const fetchOwnerDetails = async (ownerId, ownerName) => {
    try {
      setDetailsLoading(true);
      setSelectedOwner(ownerName);

      // Fetch daireler for this owner
      const dairelerResponse = await axios.get(
        `${API_BASE_URL}/daire?Ev_Sahibi_ID=${ownerId}`
      );
      const dairelerData = dairelerResponse.data;

      // For each daire, get tenant information if exists
      const detailsWithTenants = await Promise.all(
        dairelerData.map(async (daire) => {
          let tenantName = "Kiracı Yok";

          if (daire.Guncel_Kiraci_ID) {
            try {
              const tenantResponse = await axios.get(
                `${API_BASE_URL}/user?user_id=${daire.Guncel_Kiraci_ID}`
              );
              tenantName = `${tenantResponse.data.Ad} ${tenantResponse.data.Soyad}`;
            } catch (err) {
              tenantName = "Hata!!!";
            }
          }

          // Build address string
          const addressParts = [
            daire.Mahalle,
            daire.Cadde,
            daire.Sokak,
            daire.Site || daire.Apartman,
            daire.Blok,
            `Daire ${daire.Daire}`,
            daire.Ilce,
            daire.Il,
          ].filter(Boolean);

          const address = addressParts.join(" ");

          // Determine status
          let status = "-";
          if (daire.Kiralik && daire.Satilik) {
            status = "Satış & Kiralama";
          } else if (daire.Kiralik) {
            status = "Kiralık";
          } else if (daire.Satilik) {
            status = "Satılık";
          }

          // Determine price
          let price = "-";
          if (daire.Kiralik && daire.Satilik) {
            price = `${daire.Istenen_Satis_Bedeli || "?"} ₺ - ${
              daire.Istenen_Kira || "?"
            } ₺`;
          } else if (daire.Kiralik) {
            price = `${daire.Istenen_Kira || "?"} ₺`;
          } else if (daire.Satilik) {
            price = `${daire.Istenen_Satis_Bedeli || "?"} ₺`;
          }

          return {
            id: daire.id,
            address,
            status,
            price,
            tenantName,
          };
        })
      );

      setOwnerDetails(detailsWithTenants);
      setDetailsModalVisible(true);
    } catch (err) {
      let errorMessage = "Daire bilgileri yüklenirken hata oluştu";

      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.request) {
        errorMessage =
          "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
      }

      Alert.alert("Hata", errorMessage);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getFilteredData = () => {
    if (!searchText.trim()) return allOwnersData;

    return allOwnersData.filter(
      (item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.phone.toLowerCase().includes(searchText.toLowerCase()) ||
        item.email.toLowerCase().includes(searchText.toLowerCase()) ||
        item.address.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const getPaginatedData = () => {
    const filteredData = getFilteredData();
    const startIndex = (currentPage - 1) * selectedRows;
    const endIndex = startIndex + selectedRows;
    return filteredData.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filteredData = getFilteredData();
    return Math.ceil(filteredData.length / selectedRows);
  };

  const handlePageChange = (page) => {
    const totalPages = getTotalPages();
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
    setCurrentPage(1);
  };

  const handleRowsChange = (rows) => {
    setSelectedRows(rows);
    setCurrentPage(1);
  };

  const handleViewDetails = (ownerId, ownerName) => {
    fetchOwnerDetails(ownerId, ownerName);
  };

  const handleRefresh = () => {
    fetchEvSahipleri();
  };

  const TableRow = ({ item, index }) => (
    <View style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
      <Text style={[styles.tableCell, styles.nameCell]}>{item.name}</Text>
      <Text style={styles.tableCell}>{item.phone}</Text>
      <Text style={styles.tableCell}>{item.email}</Text>
      <Text style={[styles.tableCell, styles.addressCell]} numberOfLines={2}>
        {item.address}
      </Text>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => handleViewDetails(item.id, item.name)}
      >
        <Text style={styles.viewButtonText}>Görüntüle</Text>
      </TouchableOpacity>
    </View>
  );

  const DetailRow = ({ detail, index }) => (
    <View style={[styles.detailRow, index % 2 === 0 && styles.evenRow]}>
      <Text
        style={[styles.detailCell, styles.detailAddressCell]}
        numberOfLines={3}
      >
        {detail.address}
      </Text>
      <Text style={styles.detailCell}>{detail.status}</Text>
      <Text style={styles.detailCell}>{detail.price}</Text>
      <Text style={styles.detailCell}>{detail.tenantName}</Text>
    </View>
  );

  const currentData = getPaginatedData();
  const totalPages = getTotalPages();
  const filteredData = getFilteredData();

  return (
    <DashboardLayout>
      <View style={styles.headerSection}>
        <View style={styles.blueHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Ev Sahipleri</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={loading}
            >
              <Ionicons
                name="refresh"
                size={20}
                color={loading ? "#bdc3c7" : "#ffffff"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.leftControls}>
            <TouchableOpacity
              style={styles.rowSelector}
              onPress={() => {
                const newRows = selectedRows === 10 ? 5 : 10;
                handleRowsChange(newRows);
              }}
            >
              <Text style={styles.rowSelectorText}>{selectedRows}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
            <Text style={styles.recordsText}>kayıt</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Ara..."
                value={searchText}
                onChangeText={handleSearchChange}
              />
              <Ionicons
                name="search"
                size={16}
                color="#666"
                style={styles.searchIcon}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.tableHeader}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.nameHeader]}>AD-SOYAD</Text>
          <Text style={styles.headerCell}>TELEFON</Text>
          <Text style={styles.headerCell}>MAİL</Text>
          <Text style={[styles.headerCell, styles.addressHeader]}>ADRES</Text>
          <Text style={styles.headerCell}>DAİRELER</Text>
        </View>
      </View>

      <ScrollView
        style={styles.tableContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
          </View>
        ) : currentData.length > 0 ? (
          currentData.map((item, index) => (
            <TableRow key={item.id} item={item} index={index} />
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              {error
                ? "Veri yüklenemedi."
                : "Arama kriterlerinize uygun kayıt bulunamadı."}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.paginationContainer}>
        <Text style={styles.paginationText}>
          Toplam {filteredData.length} kaydın{" "}
          {(currentPage - 1) * selectedRows + 1} -{" "}
          {Math.min(currentPage * selectedRows, filteredData.length)} arası
          gösteriliyor.
        </Text>
        <View style={styles.paginationButtons}>
          <TouchableOpacity
            style={[
              styles.pageButton,
              currentPage === 1 && styles.disabledButton,
            ]}
            onPress={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <Ionicons
              name="chevron-back"
              size={16}
              color={currentPage === 1 ? "#ccc" : "#666"}
            />
          </TouchableOpacity>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <TouchableOpacity
              key={page}
              style={[
                styles.pageButton,
                currentPage === page && styles.activePageButton,
              ]}
              onPress={() => handlePageChange(page)}
            >
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === page && styles.activePageButtonText,
                ]}
              >
                {page}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[
              styles.pageButton,
              currentPage === totalPages && styles.disabledButton,
            ]}
            onPress={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <Ionicons
              name="chevron-forward"
              size={16}
              color={currentPage === totalPages ? "#ccc" : "#666"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedOwner} - Daire Listesi
              </Text>
              <TouchableOpacity
                onPress={() => setDetailsModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Details Table Header */}
            <View style={styles.detailsHeader}>
              <Text
                style={[styles.detailHeaderCell, styles.detailAddressHeader]}
              >
                ADRES
              </Text>
              <Text style={styles.detailHeaderCell}>DURUM</Text>
              <Text style={styles.detailHeaderCell}>ÜCRET</Text>
              <Text style={styles.detailHeaderCell}>KİRACI</Text>
            </View>

            <ScrollView style={styles.detailsContainer}>
              {detailsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3498db" />
                  <Text style={styles.loadingText}>
                    Daire bilgileri yükleniyor...
                  </Text>
                </View>
              ) : ownerDetails.length > 0 ? (
                ownerDetails.map((detail, index) => (
                  <DetailRow key={detail.id} detail={detail} index={index} />
                ))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>
                    Bu ev sahibine ait daire bulunamadı.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  blueHeader: {
    backgroundColor: "#3498db",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
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
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 10,
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
  controlsContainer: {
    padding: 16,
  },
  leftControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  rowSelectorText: {
    fontSize: 14,
    marginRight: 8,
  },
  recordsText: {
    fontSize: 14,
    color: "#666",
    marginRight: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    maxWidth: 200,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  searchIcon: {
    marginLeft: 8,
  },
  tableHeader: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
  },
  headerCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  nameHeader: {
    flex: 1.2,
    textAlign: "left",
  },
  addressHeader: {
    flex: 2,
    textAlign: "left",
  },
  tableContainer: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 16,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  evenRow: {
    backgroundColor: "#f8f9fa",
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 5,
  },
  nameCell: {
    flex: 1.2,
    textAlign: "left",
    fontWeight: "500",
  },
  addressCell: {
    flex: 2,
    textAlign: "left",
  },
  viewButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "500",
    textAlign: "center",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  noDataContainer: {
    padding: 40,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  paginationText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  paginationButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: "#f8f9fa",
  },
  activePageButton: {
    backgroundColor: "#3498db",
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
  },
  pageButtonText: {
    fontSize: 14,
    color: "#666",
  },
  activePageButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "90%",
    maxHeight: "80%",
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 20,
    color: "#666",
  },
  detailsHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 5,
    marginBottom: 10,
  },
  detailHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  detailAddressHeader: {
    flex: 2,
    textAlign: "left",
  },
  detailsContainer: {
    maxHeight: 400,
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  detailCell: {
    flex: 1,
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 5,
  },
  detailAddressCell: {
    flex: 2,
    textAlign: "left",
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  footerLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  footerLink: {
    fontSize: 12,
    color: "#3498db",
    marginHorizontal: 8,
    marginVertical: 2,
  },
});

export default EvSahipleri;
