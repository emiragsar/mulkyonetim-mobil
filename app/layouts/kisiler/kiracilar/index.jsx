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

const Kiracilar = () => {
  const [selectedRows, setSelectedRows] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allTenantsData, setAllTenantsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [selectedTenantName, setSelectedTenantName] = useState(null);
  const [tenantDetails, setTenantDetails] = useState([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchKiracilar();
  }, []);

  const fetchKiracilar = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_BASE_URL}/kiraci`);
      const data = response.data;

      // Format data to match component structure
      const formattedData = data.map((item) => ({
        id: item.id,
        name: item["Ad-Soyad"] || "İsim Yok",
        phone: item.Telefon || "Belirtilmemiş",
        email: item.Mail || "Belirtilmemiş",
        address: item.Adres || "Belirtilmemiş",
        skor: item.Kiraci_Skor !== null ? item.Kiraci_Skor : "N/A",
      }));

      setAllTenantsData(formattedData);
    } catch (err) {
      let errorMessage = "Kiracı listesi yüklenirken hata oluştu";
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

  const fetchTenantDetails = async (tenantId, tenantName) => {
    try {
      setDetailsLoading(true);
      setSelectedTenantName(tenantName);
      setDetailsModalVisible(true);

      const kontratResponse = await axios.get(
        `${API_BASE_URL}/kiraci_guncel_kontrat?Kiraci_ID=${tenantId}`
      );
      const kontratList = kontratResponse.data;

      if (!kontratList || kontratList.length === 0) {
        setTenantDetails([]);
        setDetailsLoading(false);
        return;
      }

      // OPTIMIZATION: Fetch all daireler and ev_sahipleri once
      const [dairelerRes, evSahipleriRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/daire`),
        axios.get(`${API_BASE_URL}/ev_sahibi`),
      ]);
      const allDaireler = dairelerRes.data;
      const allEvSahipleri = evSahipleriRes.data;

      const populatedDetails = kontratList.map((item) => {
        // Find daire (ev) info from pre-fetched data
        const daireInfo = allDaireler.find((d) => d.id === item.Daire_ID);
        const adres = daireInfo
          ? [
              daireInfo.Mahalle,
              daireInfo.Cadde,
              daireInfo.Sokak,
              daireInfo.Site || daireInfo.Apartman,
              daireInfo.Blok,
              `Daire ${daireInfo.Daire}`,
              daireInfo.Ilce,
              daireInfo.Il,
            ]
              .filter(Boolean)
              .join(" ")
          : "Adres Bilinmiyor";

        // Find ev sahibi (landlord) info from pre-fetched data
        const evSahibiInfo = allEvSahipleri.find(
          (u) => u.id === item.Ev_Sahibi_ID
        );
        const evSahibiAdSoyad = evSahibiInfo
          ? evSahibiInfo["Ad-Soyad"]
          : "Ev Sahibi Bilinmiyor";

        const sozlesmeBaslangic = `${item.Sozlesme_Baslangic_Gun}/${item.Sozlesme_Baslangic_Ay}/${item.Sozlesme_Baslangic_Yil}`;

        return {
          id: item.id,
          kiralikEv: adres,
          evSahibi: evSahibiAdSoyad,
          kiraBedeli: `${item.Sozlesme_Aylik_Bedel || "N/A"} ₺`,
          sozlesmeBaslangic,
        };
      });

      setTenantDetails(populatedDetails);
    } catch (err) {
      let errorMessage = "Kontrat bilgileri yüklenirken hata oluştu";
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.request) {
        errorMessage =
          "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
      }
      Alert.alert("Hata", errorMessage);
      setTenantDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getFilteredData = () => {
    if (!searchText.trim()) return allTenantsData;
    return allTenantsData.filter(
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
    return filteredData.slice(startIndex, startIndex + selectedRows);
  };

  const getTotalPages = () =>
    Math.ceil(getFilteredData().length / selectedRows) || 1;
  const handlePageChange = (page) => {
    const totalPages = getTotalPages();
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };
  const handleSearchChange = (text) => {
    setSearchText(text);
    setCurrentPage(1);
  };
  const handleRowsChange = (rows) => {
    setSelectedRows(rows);
    setCurrentPage(1);
  };
  const handleViewDetails = (tenantId, tenantName) =>
    fetchTenantDetails(tenantId, tenantName);
  const handleRefresh = () => fetchKiracilar();

  const TableRow = ({ item, index }) => (
    <View style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
      <Text style={[styles.tableCell, styles.nameCell]}>{item.name}</Text>
      <Text style={[styles.tableCell, { flex: 1.2 }]}>{item.phone}</Text>
      <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.email}</Text>
      <Text style={[styles.tableCell, styles.addressCell]} numberOfLines={2}>
        {item.address}
      </Text>
      <Text style={[styles.tableCell, { flex: 0.5 }]}>{item.skor}</Text>
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
        {detail.kiralikEv}
      </Text>
      <Text style={styles.detailCell}>{detail.evSahibi}</Text>
      <Text style={styles.detailCell}>{detail.kiraBedeli}</Text>
      <Text style={styles.detailCell}>{detail.sozlesmeBaslangic}</Text>
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
            <Text style={styles.headerTitle}>Kiracılar</Text>
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
              onPress={() => handleRowsChange(selectedRows === 10 ? 5 : 10)}
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

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tableHeader}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.nameHeader]}>AD-SOYAD</Text>
          <Text style={[styles.headerCell, { flex: 1.2 }]}>TELEFON</Text>
          <Text style={[styles.headerCell, { flex: 1.5 }]}>MAİL</Text>
          <Text style={[styles.headerCell, styles.addressHeader]}>ADRES</Text>
          <Text style={[styles.headerCell, { flex: 0.5 }]}>SKOR</Text>
          <Text style={styles.headerCell}>GÜNCEL KONTRAT</Text>
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
              {!error
                ? "Arama kriterlerinize uygun kayıt bulunamadı."
                : "Veri yüklenemedi."}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.paginationContainer}>
        <Text style={styles.paginationText}>
          Toplam {filteredData.length} kaydın{" "}
          {filteredData.length > 0 ? (currentPage - 1) * selectedRows + 1 : 0} -{" "}
          {Math.min(currentPage * selectedRows, filteredData.length)} arası
          gösteriliyor.
        </Text>
        <View style={styles.paginationButtons}>
          <TouchableOpacity
            style={[
              styles.pageButton,
              (currentPage === 1 || totalPages === 1) && styles.disabledButton,
            ]}
            onPress={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || totalPages === 1}
          >
            <Ionicons
              name="chevron-back"
              size={16}
              color={currentPage === 1 || totalPages === 1 ? "#ccc" : "#666"}
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
              (currentPage === totalPages || totalPages === 1) &&
                styles.disabledButton,
            ]}
            onPress={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 1}
          >
            <Ionicons
              name="chevron-forward"
              size={16}
              color={
                currentPage === totalPages || totalPages === 1 ? "#ccc" : "#666"
              }
            />
          </TouchableOpacity>
        </View>
      </View>

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
                {selectedTenantName} - Kontrat Listesi
              </Text>
              <TouchableOpacity
                onPress={() => setDetailsModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailsHeader}>
              <Text
                style={[styles.detailHeaderCell, styles.detailAddressHeader]}
              >
                KİRALIK EV ADRESİ
              </Text>
              <Text style={styles.detailHeaderCell}>EV SAHİBİ</Text>
              <Text style={styles.detailHeaderCell}>KİRA BEDELİ</Text>
              <Text style={styles.detailHeaderCell}>BAŞLANGIÇ</Text>
            </View>
            <ScrollView style={styles.detailsContainer}>
              {detailsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3498db" />
                  <Text style={styles.loadingText}>
                    Kontrat bilgileri yükleniyor...
                  </Text>
                </View>
              ) : tenantDetails.length > 0 ? (
                tenantDetails.map((detail, index) => (
                  <DetailRow key={detail.id} detail={detail} index={index} />
                ))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>
                    Bu kiracıya ait güncel kontrat bulunamadı.
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
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
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
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  noDataContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: "#e9ecef",
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
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    color: "#333",
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 20,
    color: "#666",
    fontWeight: "bold",
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
});

export default Kiracilar;
