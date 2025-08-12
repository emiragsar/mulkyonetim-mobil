import DashboardLayout from "@/app/components/dashboardlayout";
import DataTable from "@/app/components/tables";
import API_BASE_URL from "@/config/api";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const DairelerTahliye = () => {
  const [allDaireData, setAllDaireData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [imageGalleryItems, setImageGalleryItems] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [oldTenants, setOldTenants] = useState([]);
  const [selectedDaireId, setSelectedDaireId] = useState(null);
  const [oldTenantsModalVisible, setOldTenantsModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState("");
  const [detailModalTitle, setDetailModalTitle] = useState("");

  // Batch fetch all users at once
  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      return response.data.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
    } catch (error) {
      console.error("Error fetching all users:", error);
      return {};
    }
  }, []);

  useEffect(() => {
    fetchDaireler();
  }, []);

  const fetchDaireler = async () => {
    try {
      setLoading(true);
      setError("");

      const [daireRes, userMap] = await Promise.all([
        axios.get(`${API_BASE_URL}/daire/tahliye`), // Tahliye endpoint'i
        fetchAllUsers(),
      ]);

      const enrichedRows = daireRes.data.map((item) => {
        const evSahibi = userMap[item.Ev_Sahibi_ID];
        const kiraci = item.Guncel_Kiraci_ID
          ? userMap[item.Guncel_Kiraci_ID]
          : null;

        const evSahibiAd = evSahibi
          ? `${evSahibi.Ad} ${evSahibi.Soyad}`
          : "Bilinmiyor";
        const kiraciAd = kiraci ? `${kiraci.Ad} ${kiraci.Soyad}` : "Yok";

        const evSahibiDetail = evSahibi
          ? `Ad Soyad: ${evSahibi.Ad} ${evSahibi.Soyad}\nAdres: ${
              evSahibi.Adres || "-"
            }\nTelefon: ${evSahibi.Telefon || "-"}\nSkor: ${
              evSahibi.Ev_Sahibi_Skor ?? "N/A"
            }`
          : "Bilinmiyor";

        const kiraciDetail = kiraci
          ? `Ad Soyad: ${kiraci.Ad} ${kiraci.Soyad}\nAdres: ${
              kiraci.Adres || "-"
            }\nTelefon: ${kiraci.Telefon || "-"}\nSkor: ${
              kiraci.Kiraci_Skor ?? "N/A"
            }`
          : "Kiracı bulunmamaktadır";

        const adresText = [
          item.Mahalle,
          item.Cadde,
          item.Sokak,
          item.Site || item.Apartman,
          item.Blok,
          `Daire ${item.Daire}`,
          item.Ilce,
          item.Il,
        ]
          .filter(Boolean)
          .join(" ");

        let durumText = "-";
        if (item.Kiralik && item.Satilik) {
          durumText = "Satış & Kiralama";
        } else if (item.Kiralik) {
          durumText = "Kiralık";
        } else if (item.Satilik) {
          durumText = "Satılık";
        }

        let ucretText = "-";
        if (item.Kiralik && item.Satilik) {
          ucretText = `${item.Istenen_Satis_Bedeli || "?"} ₺ - ${
            item.Istenen_Kira || "?"
          } ₺`;
        } else if (item.Kiralik) {
          ucretText = `${item.Istenen_Kira || "?"} ₺`;
        } else if (item.Satilik) {
          ucretText = `${item.Istenen_Satis_Bedeli || "?"} ₺`;
        }

        return {
          id: item.Daire_ID,
          adres: adresText,
          ev_sahibi: evSahibiAd,
          kiraci: kiraciAd,
          durum: durumText,
          istenen_ucret: ucretText,
          ev_sahibi_detail: evSahibiDetail,
          kiraci_detail: kiraciDetail,
        };
      });

      setAllDaireData(enrichedRows);
    } catch (err) {
      let errorMessage =
        "Tahliye edilecek daire listesi yüklenirken hata oluştu";
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

  // View photos for a given apartment ID
  const handleViewPhotos = async (daireId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/daire_fotograf?Daire_ID=${daireId}`
      );
      if (response.data.length === 0) {
        Alert.alert("Bilgi", "Bu daireye ait fotoğraf bulunamadı.");
        return;
      }
      const galleryItems = response.data.map((photo) => ({
        uri: photo.Url,
        description: `${photo.Fotograf_Aciklama || ""} - ${photo.Tarih || ""}`,
      }));
      setImageGalleryItems(galleryItems);
      setCurrentImageIndex(0);
      setShowGallery(true);
    } catch (error) {
      console.error("Error fetching daire photos:", error);
      Alert.alert("Hata", "Fotoğraflar yüklenirken hata oluştu.");
    }
  };

  // View documents for a given apartment ID
  const handleViewDocuments = async (daireId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/daire_belge?Daire_ID=${daireId}`
      );
      if (response.data.length === 0) {
        Alert.alert("Bilgi", "Bu daireye ait belge bulunamadı.");
        return;
      }
      const galleryItems = response.data.map((belge) => ({
        uri: belge.Url,
        description: `${belge.Belge_Aciklama || ""} - ${
          belge.Belge_Tarihi || ""
        }`,
      }));
      setImageGalleryItems(galleryItems);
      setCurrentImageIndex(0);
      setShowGallery(true);
    } catch (error) {
      console.error("Error fetching daire documents:", error);
      Alert.alert("Hata", "Belgeler yüklenirken hata oluştu.");
    }
  };

  // View old tenants for a given apartment ID
  const handleViewOldTenants = async (daireId) => {
    try {
      const [res, userMap] = await Promise.all([
        axios.get(`${API_BASE_URL}/kontrat?Daire_ID=${daireId}`),
        fetchAllUsers(),
      ]);

      const filtered = res.data.filter(
        (item) => item.Sozlesme_Durumu_Aktif === false
      );

      if (filtered.length === 0) {
        Alert.alert("Bilgi", "Bu daireye ait eski kiracı bulunamadı.");
        return;
      }

      const enrichedTenants = filtered.map((item) => {
        const user = userMap[item.Kiraci_ID];
        const adSoyad = user ? `${user.Ad} ${user.Soyad}` : "Bilinmiyor";

        return {
          id: item.id,
          adSoyad,
          donem: `${item.Sozlesme_Baslangic_Ay}/${item.Sozlesme_Baslangic_Yil} - ${item.Sozlesme_Bitis_Ay}/${item.Sozlesme_Bitis_Yil}`,
          aylikBedel: `${item.Sozlesme_Aylik_Bedel || "N/A"} ₺`,
          toplamOdeme: `${item.Toplam_Odeme || "N/A"} ₺`,
          gecikenOdeme: `${item.Toplam_Geciken_Odeme || "N/A"} ₺`,
          depozito: `${item.Depozito || "N/A"} ₺`,
        };
      });

      setOldTenants(enrichedTenants);
      setSelectedDaireId(daireId);
      setOldTenantsModalVisible(true);
    } catch (error) {
      console.error("Error fetching old tenants:", error);
      Alert.alert("Hata", "Eski kiracı bilgileri yüklenirken hata oluştu.");
    }
  };

  const handleShowDetail = (detail, title) => {
    setSelectedDetail(detail);
    setDetailModalTitle(title);
    setDetailModalVisible(true);
  };

  const handleRefresh = () => {
    fetchDaireler();
  };

  // DataTable için kolonları tanımlıyoruz - Horizontal scroll için minWidth ekliyoruz
  const columns = [
    {
      Header: "ADRES",
      accessor: "adres",
      minWidth: 200,
      flex: 3,
      align: "left",
      Cell: ({ value }) => (
        <Text style={styles.addressCell} numberOfLines={4}>
          {value}
        </Text>
      ),
    },
    {
      Header: "EV SAHİBİ",
      accessor: "ev_sahibi",
      minWidth: 120,
      flex: 2,
      align: "left",
      Cell: ({ value, row }) => (
        <TouchableOpacity
          onPress={() =>
            handleShowDetail(
              row.original.ev_sahibi_detail,
              "Ev Sahibi Bilgileri"
            )
          }
        >
          <Text style={styles.clickableCell} numberOfLines={2}>
            {value}
          </Text>
        </TouchableOpacity>
      ),
    },
    {
      Header: "KİRACI",
      accessor: "kiraci",
      minWidth: 120,
      flex: 2,
      align: "left",
      Cell: ({ value, row }) => (
        <TouchableOpacity
          onPress={() =>
            handleShowDetail(row.original.kiraci_detail, "Kiracı Bilgileri")
          }
        >
          <Text
            style={[styles.clickableCell, styles.urgentTenantCell]}
            numberOfLines={2}
          >
            {value}
          </Text>
        </TouchableOpacity>
      ),
    },
    {
      Header: "DURUM",
      accessor: "durum",
      minWidth: 100,
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <View style={styles.statusContainer}>
          <Text style={styles.statusCell} numberOfLines={2}>
            {value}
          </Text>
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentBadgeText}>TAHLİYE</Text>
          </View>
        </View>
      ),
    },
    {
      Header: "ÜCRET",
      accessor: "istenen_ucret",
      minWidth: 100,
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={styles.priceCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "FOTOĞRAF",
      accessor: "id",
      minWidth: 80,
      flex: 1,
      align: "center",
      Cell: ({ value }) => (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewPhotos(value)}
        >
          <Text style={styles.actionButtonText}>Görüntüle</Text>
        </TouchableOpacity>
      ),
    },
    {
      Header: "BELGE",
      accessor: "id",
      minWidth: 80,
      flex: 1,
      align: "center",
      Cell: ({ value }) => (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewDocuments(value)}
        >
          <Text style={styles.actionButtonText}>Görüntüle</Text>
        </TouchableOpacity>
      ),
    },
    {
      Header: "ESKİ KİRACI",
      accessor: "id",
      minWidth: 90,
      flex: 1.2,
      align: "center",
      Cell: ({ value }) => (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewOldTenants(value)}
        >
          <Text style={styles.actionButtonText}>Görüntüle</Text>
        </TouchableOpacity>
      ),
    },
  ];

  // Old tenants table columns
  const oldTenantsColumns = [
    {
      Header: "KİRACI ADI",
      accessor: "adSoyad",
      minWidth: 120,
      flex: 2,
      align: "left",
      Cell: ({ value }) => (
        <Text style={styles.tableCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "DÖNEM",
      accessor: "donem",
      minWidth: 100,
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={styles.tableCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "AYLIK BEDEL",
      accessor: "aylikBedel",
      minWidth: 90,
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={styles.tableCell} numberOfLines={1}>
          {value}
        </Text>
      ),
    },
    {
      Header: "TOPLAM ÖDEME",
      accessor: "toplamOdeme",
      minWidth: 100,
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={styles.tableCell} numberOfLines={1}>
          {value}
        </Text>
      ),
    },
    {
      Header: "GECİKEN ÖDEME",
      accessor: "gecikenOdeme",
      minWidth: 100,
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={styles.tableCell} numberOfLines={1}>
          {value}
        </Text>
      ),
    },
    {
      Header: "DEPOZİTO",
      accessor: "depozito",
      minWidth: 90,
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={styles.tableCell} numberOfLines={1}>
          {value}
        </Text>
      ),
    },
  ];

  // DataTable için veri yapısını hazırlıyoruz
  const tableData = {
    columns,
    rows: allDaireData,
  };

  const oldTenantsTableData = {
    columns: oldTenantsColumns,
    rows: oldTenants,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f39c12" />
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.blueHeader}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Ionicons
                  name="warning"
                  size={24}
                  color="#fff"
                  style={styles.warningIcon}
                />
                <Text style={styles.headerTitle}>
                  Tahliye Edilecek Daireler
                </Text>
              </View>
              <View style={styles.headerStats}>
                <Text style={styles.statsText}>
                  {allDaireData.length} Daire
                </Text>
              </View>
            </View>
          </View>

          {/* DataTable with Horizontal Scroll */}
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

        {/* Image Gallery Modal */}
        <Modal
          visible={showGallery}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowGallery(false)}
        >
          <View style={styles.galleryOverlay}>
            <View style={styles.galleryContainer}>
              <View style={styles.galleryHeader}>
                <Text style={styles.galleryTitle}>
                  {currentImageIndex + 1} / {imageGalleryItems.length}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowGallery(false)}
                  style={styles.galleryCloseButton}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={imageGalleryItems}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x / screenWidth
                  );
                  setCurrentImageIndex(index);
                }}
                renderItem={({ item }) => (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.galleryImage}
                      resizeMode="contain"
                    />
                    {item.description ? (
                      <View style={styles.imageDescriptionContainer}>
                        <Text style={styles.imageDescription}>
                          {item.description}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
              />

              <View style={styles.galleryNavigation}>
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    currentImageIndex === 0 && styles.disabledNavButton,
                  ]}
                  onPress={() => {
                    if (currentImageIndex > 0) {
                      setCurrentImageIndex(currentImageIndex - 1);
                    }
                  }}
                  disabled={currentImageIndex === 0}
                >
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.navButton,
                    currentImageIndex === imageGalleryItems.length - 1 &&
                      styles.disabledNavButton,
                  ]}
                  onPress={() => {
                    if (currentImageIndex < imageGalleryItems.length - 1) {
                      setCurrentImageIndex(currentImageIndex + 1);
                    }
                  }}
                  disabled={currentImageIndex === imageGalleryItems.length - 1}
                >
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Old Tenants Modal */}
        <Modal
          visible={oldTenantsModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setOldTenantsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Eski Kiracılar</Text>
                <TouchableOpacity
                  onPress={() => setOldTenantsModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <DataTable
                table={oldTenantsTableData}
                entriesPerPage={{
                  defaultValue: 5,
                  entries: [5, 10, 15],
                }}
                canSearch={false}
                showTotalEntries={true}
                isSorted={false}
                noEndBorder={false}
              />
            </View>
          </View>
        </Modal>

        {/* Detail Modal */}
        <Modal
          visible={detailModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.detailModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{detailModalTitle}</Text>
                <TouchableOpacity
                  onPress={() => setDetailModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.detailContent}>
                <Text style={styles.detailText}>{selectedDetail}</Text>
              </ScrollView>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
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
    backgroundColor: "#3498db", // Turuncu renk - tahliye için
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  warningIcon: {
    marginRight: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerStats: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 10,
  },
  statsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
  addressCell: {
    fontSize: 9,
    color: "#333",
    lineHeight: 12,
  },
  clickableCell: {
    fontSize: 9,
    color: "#3498db",
    textDecorationLine: "underline",
    lineHeight: 12,
  },
  urgentTenantCell: {
    color: "#f39c12", // Turuncu renk - tahliye edilecek kiracı
    fontWeight: "600",
  },
  statusContainer: {
    alignItems: "center",
  },
  statusCell: {
    fontSize: 9,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 4,
  },
  urgentBadge: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgentBadgeText: {
    color: "#fff",
    fontSize: 7,
    fontWeight: "bold",
  },
  priceCell: {
    fontSize: 9,
    color: "#2E7D32",
    textAlign: "center",
    fontWeight: "600",
  },
  tableCell: {
    fontSize: 9,
    color: "#333",
    textAlign: "center",
  },
  actionButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: "center",
    minWidth: 60,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "500",
  },
  // Gallery Modal styles
  galleryOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  galleryContainer: {
    flex: 1,
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  galleryTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  galleryCloseButton: {
    padding: 10,
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight - 200,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryImage: {
    width: screenWidth - 40,
    height: screenHeight - 300,
  },
  imageDescriptionContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 8,
  },
  imageDescription: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  galleryNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  navButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledNavButton: {
    opacity: 0.3,
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
    width: "95%",
    maxHeight: "85%",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  detailModalContent: {
    backgroundColor: "white",
    width: "90%",
    maxHeight: "70%",
    borderRadius: 12,
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
    color: "#333",
    flex: 1,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 20,
    color: "#666",
    fontWeight: "bold",
  },
  detailContent: {
    maxHeight: 300,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  closeButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DairelerTahliye;
