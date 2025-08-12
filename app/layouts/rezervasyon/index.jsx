import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Custom components
import PageLayout from "@/app/components/shared/PageLayout.jsx";
import DataTable from "@/app/components/tables";
import API_BASE_URL from "@/config/api";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// =================================================================
// CUSTOM HOOK
// =================================================================
const useReservationTableData = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageGalleryItems, setImageGalleryItems] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openReservationDialog, setOpenReservationDialog] = useState(false);
  const [selectedDaireId, setSelectedDaireId] = useState(null);
  const [selectedDaireAdres, setSelectedDaireAdres] = useState("");
  const [selectedDetail, setSelectedDetail] = useState("");
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    type: "info",
  });

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

  const handleViewPhotos = async (daireId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/daire_fotograf?Daire_ID=${daireId}`
      );
      const galleryItems = res.data.map((photo) => ({
        id: photo.Fotograf_ID,
        uri: photo.Url,
        description: `${photo.Fotograf_Aciklama} - ${photo.Tarih}`,
      }));
      setImageGalleryItems(galleryItems);
      setCurrentImageIndex(0);
      setShowGallery(true);
    } catch (error) {
      console.error("Error fetching daire photos:", error);
      showNotification("Fotoğraflar yüklenirken hata oluştu", "error");
    }
  };

  const handleRezerveEt = (daireId, daireAdres) => {
    setSelectedDaireId(daireId);
    setSelectedDaireAdres(daireAdres);
    setOpenReservationDialog(true);
  };

  const handleShowDetail = (detail) => {
    setSelectedDetail(detail);
    setDetailModalVisible(true);
  };

  const showNotification = (message, type = "info") => {
    setNotification({
      visible: true,
      message,
      type,
    });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleConfirmReservation = async (id, data, kisiListesi) => {
    if (!id) {
      console.error("handleConfirmReservation: Daire ID'si alınamadı!");
      showNotification(
        "İşlem sırasında bir hata oluştu: Daire ID'si eksik.",
        "error"
      );
      return;
    }
    try {
      await axios.patch(`${API_BASE_URL}/daire/${id}`, {
        KisaDonemli_Kiralik: false,
      });
      setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      setOpenReservationDialog(false);
      showNotification("Daire başarıyla rezerve edildi!", "success");
      console.log("Rezervasyon başarılı. Güncellenen Daire ID:", id);
      console.log("Gönderilen Form Verisi:", { data, kisiListesi });
    } catch (error) {
      console.error("Daire durumu güncellenirken hata oluştu:", error);
      showNotification(
        "Rezervasyon işlemi sırasında bir sunucu hatası oluştu.",
        "error"
      );
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [daireRes, userMap] = await Promise.all([
        axios.get(`${API_BASE_URL}/daire`),
        fetchAllUsers(),
      ]);

      const kisaDonemliDaireler = daireRes.data.filter(
        (item) => item.KisaDonemli_Kiralik === true
      );

      const enrichedRows = kisaDonemliDaireler.map((item) => {
        const evSahibi = userMap[item.Ev_Sahibi_ID];
        const evSahibiAd = evSahibi
          ? `${evSahibi.Ad} ${evSahibi.Soyad}`
          : "Bilinmiyor";
        const evSahibiDetail = evSahibi
          ? `${evSahibi.Ad} ${evSahibi.Soyad}\n${
              evSahibi.Adres || "-"
            }\nTelefon: ${evSahibi.Telefon || "-"}\n${
              evSahibi.Kiraci_Skor ? `Skor: ${evSahibi.Kiraci_Skor}` : ""
            }`
          : "Bilinmiyor";

        return {
          id: item.Daire_ID,
          adres: `${item.Mahalle ?? ""} ${item.Cadde ?? ""} ${
            item.Sokak ?? ""
          } ${item.Site || item.Apartman || ""} ${item.Blok ?? ""} ${
            item.Daire ?? ""
          } ${item.Ilce ?? ""} ${item.Il ?? ""}`,
          ev_sahibi: evSahibiAd,
          istenen_ucret:
            item.Istenen_Kira || item.Istenen_Satis_Bedeli || "Belirtilmemiş",
          ev_sahibi_detail: evSahibiDetail,
        };
      });

      setRows(enrichedRows);
    } catch (error) {
      console.error("Error fetching short term rental data:", error);
      setError("Veriler yüklenirken hata oluştu");
      showNotification("Veriler yüklenirken hata oluştu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchAllUsers]);

  return {
    rows,
    loading,
    error,
    imageGalleryItems,
    showGallery,
    setShowGallery,
    currentImageIndex,
    setCurrentImageIndex,
    reservationDialogState: {
      open: openReservationDialog,
      daireId: selectedDaireId,
      adres: selectedDaireAdres,
    },
    setOpenReservationDialog,
    handleConfirmReservation,
    handleViewPhotos,
    handleRezerveEt,
    handleShowDetail,
    selectedDetail,
    detailModalVisible,
    setDetailModalVisible,
    notification,
    showNotification,
    handleRefresh,
  };
};

// =================================================================
// CUSTOM DATE PICKER MODAL COMPONENT
// =================================================================
const CustomDatePickerModal = ({
  visible,
  onClose,
  onDateSelect,
  currentDate,
  minimumDate,
  title,
}) => {
  const [tempDate, setTempDate] = useState(currentDate);

  useEffect(() => {
    if (visible) {
      setTempDate(currentDate);
    }
  }, [visible, currentDate]);

  const handleConfirm = () => {
    onDateSelect(tempDate);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.datePickerOverlay}>
        <View style={styles.datePickerModal}>
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.datePickerCloseButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.datePickerContent}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setTempDate(selectedDate);
                }
              }}
              minimumDate={minimumDate}
              textColor="#2c3e50"
              style={styles.dateTimePicker}
            />
          </View>

          <View style={styles.datePickerActions}>
            <TouchableOpacity
              style={styles.datePickerCancelButton}
              onPress={onClose}
            >
              <Text style={styles.datePickerCancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.datePickerConfirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.datePickerConfirmText}>Seç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// =================================================================
// RESERVATION DIALOG COMPONENT
// =================================================================
const ReservationDialogComponent = ({
  visible,
  onClose,
  onConfirm,
  daireId,
  daireAdres,
}) => {
  const [reservationData, setReservationData] = useState({
    gunSayisi: "",
    girisTarihi: new Date(),
    cikisTarihi: new Date(),
  });
  const [kisiListesi, setKisiListesi] = useState([]);
  const [showGirisPicker, setShowGirisPicker] = useState(false);
  const [showCikisPicker, setShowCikisPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      setReservationData({
        gunSayisi: "",
        girisTarihi: today,
        cikisTarihi: tomorrow,
      });
      setKisiListesi([{ id: Date.now(), ad: "", soyad: "" }]);
    }
  }, [visible]);

  const handleInputChange = useCallback((field, value) => {
    setReservationData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleDateSelect = (selectedDate, type) => {
    setReservationData((prev) => ({
      ...prev,
      [type]: selectedDate,
    }));

    // Otomatik gün sayısı hesaplama
    if (type === "girisTarihi" || type === "cikisTarihi") {
      const giris =
        type === "girisTarihi" ? selectedDate : reservationData.girisTarihi;
      const cikis =
        type === "cikisTarihi" ? selectedDate : reservationData.cikisTarihi;

      if (giris && cikis && cikis > giris) {
        const diffTime = Math.abs(cikis - giris);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setReservationData((prev) => ({
          ...prev,
          gunSayisi: diffDays.toString(),
        }));
      }
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("tr-TR");
  };

  const handleKisiBilgiChange = useCallback((index, field, value) => {
    setKisiListesi((prev) => {
      const newList = [...prev];
      newList[index] = { ...newList[index], [field]: value };
      return newList;
    });
  }, []);

  const handleKisiEkle = () => {
    setKisiListesi((prevList) => [
      ...prevList,
      { id: Date.now(), ad: "", soyad: "" },
    ]);
  };

  const handleKisiSil = (idToRemove) => {
    if (kisiListesi.length > 1) {
      setKisiListesi((prevList) =>
        prevList.filter((kisi) => kisi.id !== idToRemove)
      );
    }
  };

  const handleConfirm = () => {
    onConfirm(daireId, reservationData, kisiListesi);
  };

  if (!visible) return null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Rezervasyon Yap</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Daire Adresi:</Text>
                <Text style={styles.addressText}>{daireAdres}</Text>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Gün Sayısı</Text>
                  <TextInput
                    style={styles.textInput}
                    value={reservationData.gunSayisi}
                    onChangeText={(value) =>
                      handleInputChange("gunSayisi", value)
                    }
                    keyboardType="numeric"
                    placeholder="Gün sayısını giriniz"
                    placeholderTextColor="#95a5a6"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Giriş Tarihi</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowGirisPicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {formatDate(reservationData.girisTarihi)}
                    </Text>
                    <Ionicons name="calendar" size={20} color="#3498db" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Çıkış Tarihi</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowCikisPicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {formatDate(reservationData.cikisTarihi)}
                    </Text>
                    <Ionicons name="calendar" size={20} color="#3498db" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider}>
                <Text style={styles.dividerText}>Konaklayacak Kişiler</Text>
              </View>

              {kisiListesi.map((kisi, index) => (
                <View key={kisi.id} style={styles.personRow}>
                  <Text style={styles.personNumber}>{index + 1}.</Text>
                  <View style={styles.personInputs}>
                    <TextInput
                      style={[styles.textInput, styles.personInput]}
                      value={kisi.ad}
                      onChangeText={(value) =>
                        handleKisiBilgiChange(index, "ad", value)
                      }
                      placeholder="Ad"
                      placeholderTextColor="#95a5a6"
                    />
                    <TextInput
                      style={[styles.textInput, styles.personInput]}
                      value={kisi.soyad}
                      onChangeText={(value) =>
                        handleKisiBilgiChange(index, "soyad", value)
                      }
                      placeholder="Soyad"
                      placeholderTextColor="#95a5a6"
                    />
                  </View>
                  {kisiListesi.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleKisiSil(kisi.id)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity
                style={styles.addPersonButton}
                onPress={handleKisiEkle}
              >
                <Ionicons name="add" size={20} color="#3498db" />
                <Text style={styles.addPersonText}>Kişi Ekle</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Onayla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Date Picker Modals */}
      <CustomDatePickerModal
        visible={showGirisPicker}
        onClose={() => setShowGirisPicker(false)}
        onDateSelect={(date) => handleDateSelect(date, "girisTarihi")}
        currentDate={reservationData.girisTarihi}
        minimumDate={new Date()}
        title="Giriş Tarihi Seçin"
      />

      <CustomDatePickerModal
        visible={showCikisPicker}
        onClose={() => setShowCikisPicker(false)}
        onDateSelect={(date) => handleDateSelect(date, "cikisTarihi")}
        currentDate={reservationData.cikisTarihi}
        minimumDate={reservationData.girisTarihi}
        title="Çıkış Tarihi Seçin"
      />
    </>
  );
};

// =================================================================
// IMAGE GALLERY COMPONENT
// =================================================================
const ImageGalleryComponent = ({
  visible,
  images,
  currentIndex,
  onIndexChange,
  onClose,
}) => {
  if (!visible || !images.length) return null;

  const nextImage = () => {
    if (images.length > 1) {
      const newIndex =
        currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      onIndexChange(newIndex);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      const newIndex =
        currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      onIndexChange(newIndex);
    }
  };

  const renderThumbnail = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => onIndexChange(index)}
      style={[
        styles.thumbnail,
        currentIndex === index && styles.activeThumbnail,
      ]}
    >
      <Image source={{ uri: item.uri }} style={styles.thumbnailImage} />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.galleryContainer}>
        <View style={styles.galleryHeader}>
          <TouchableOpacity onPress={onClose} style={styles.galleryCloseButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.galleryCounter}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>

        <View style={styles.mainImageContainer}>
          <Image
            source={{ uri: images[currentIndex]?.uri }}
            style={styles.mainImage}
            resizeMode="contain"
          />

          {images.length > 1 && (
            <View style={styles.navigationButtons}>
              <TouchableOpacity style={styles.navButton} onPress={prevImage}>
                <Ionicons name="chevron-back" size={30} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={nextImage}>
                <Ionicons name="chevron-forward" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {images.length > 1 && (
          <View style={styles.thumbnailContainer}>
            <FlatList
              data={images}
              renderItem={renderThumbnail}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailList}
            />
          </View>
        )}

        {images[currentIndex]?.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              {images[currentIndex].description}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

// =================================================================
// NOTIFICATION COMPONENT
// =================================================================
const NotificationComponent = ({ notification }) => {
  if (!notification.visible) return null;

  const getNotificationStyle = () => {
    switch (notification.type) {
      case "success":
        return styles.notificationSuccess;
      case "error":
        return styles.notificationError;
      case "warning":
        return styles.notificationWarning;
      default:
        return styles.notificationInfo;
    }
  };

  const getIconName = () => {
    switch (notification.type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "alert-circle";
      case "warning":
        return "warning";
      default:
        return "information-circle";
    }
  };

  return (
    <View style={[styles.notification, getNotificationStyle()]}>
      <Ionicons name={getIconName()} size={20} color="#fff" />
      <Text style={styles.notificationText}>{notification.message}</Text>
    </View>
  );
};

// =================================================================
// MAIN COMPONENT
// =================================================================
const ReservationTable = () => {
  const {
    rows,
    loading,
    error,
    imageGalleryItems,
    showGallery,
    setShowGallery,
    currentImageIndex,
    setCurrentImageIndex,
    reservationDialogState,
    setOpenReservationDialog,
    handleConfirmReservation,
    handleViewPhotos,
    handleRezerveEt,
    handleShowDetail,
    selectedDetail,
    detailModalVisible,
    setDetailModalVisible,
    notification,
    handleRefresh,
  } = useReservationTableData();

  // DataTable için kolonları tanımlıyoruz
  const columns = [
    {
      Header: "ADRES",
      accessor: "adres",
      flex: 4,
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
      flex: 2,
      align: "left",
      Cell: ({ value, row }) => (
        <TouchableOpacity
          onPress={() => handleShowDetail(row.original.ev_sahibi_detail)}
        >
          <Text numberOfLines={2}>{value}</Text>
        </TouchableOpacity>
      ),
    },
    {
      Header: "ÜCRET",
      accessor: "istenen_ucret",
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={styles.priceCell} numberOfLines={2}>
          {value} ₺
        </Text>
      ),
    },
    {
      Header: "FOTOĞRAF",
      accessor: "id",
      flex: 1.2,
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
      Header: "REZERVE ET",
      accessor: "id",
      flex: 1.5,
      align: "center",
      Cell: ({ value, row }) => (
        <TouchableOpacity
          style={[styles.actionButton, styles.reserveButton]}
          onPress={() => handleRezerveEt(value, row.original.adres)}
        >
          <Text style={[styles.actionButtonText, styles.reserveButtonText]}>
            Rezerve Et
          </Text>
        </TouchableOpacity>
      ),
    },
  ];

  // DataTable için veri yapısını hazırlıyoruz
  const tableData = {
    columns,
    rows,
  };

  if (loading) {
    return (
      <PageLayout
        title="Kısa Dönemli Kiralık Daireler"
        tableData={tableData}
        onRefresh={handleRefresh}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
        </View>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        title="Kısa Dönemli Kiralık Daireler"
        tableData={tableData}
        onRefresh={handleRefresh}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Kısa Dönemli Kiralık Daireler"
      tableData={tableData}
      onRefresh={handleRefresh}
    >
      <View style={styles.container}>
        {/* Rezervasyon Dialog */}
        <ReservationDialogComponent
          visible={reservationDialogState.open}
          daireId={reservationDialogState.daireId}
          daireAdres={reservationDialogState.adres}
          onClose={() => setOpenReservationDialog(false)}
          onConfirm={handleConfirmReservation}
        />

        {/* Fotoğraf Galerisi */}
        <ImageGalleryComponent
          visible={showGallery}
          images={imageGalleryItems}
          currentIndex={currentImageIndex}
          onIndexChange={setCurrentImageIndex}
          onClose={() => setShowGallery(false)}
        />

        {/* Ev Sahibi Detay Dialog */}
        <Modal
          visible={detailModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ev Sahibi Bilgileri</Text>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailContent}>
                <Text style={styles.detailText}>{selectedDetail}</Text>
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setDetailModalVisible(false)}
              >
                <Text style={styles.confirmButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Notification */}
        <NotificationComponent notification={notification} />
      </View>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerSection: {
    backgroundColor: "#fff",
  },
  blueHeader: {
    backgroundColor: "#3498db",
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  headerStats: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginLeft: 10,
  },
  statsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  refreshButton: {
    padding: 8,
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7f8c8d",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // DataTable Cell Styles
  addressCell: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
    lineHeight: 18,
  },

  priceCell: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
    textAlign: "center",
  },
  actionButton: {
    backgroundColor: "#ecf0f1",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#27ae60",
    fontWeight: "600",
  },
  reserveButton: {
    backgroundColor: "#3498db",
  },
  reserveButtonText: {
    color: "#fff",
  },

  // Modal Container Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
    backgroundColor: "#f8f9fa",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  addressContainer: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 16,
    color: "#34495e",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#2c3e50",
    minHeight: 50,
  },
  divider: {
    alignItems: "center",
    marginVertical: 20,
  },
  dividerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7f8c8d",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  personNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    width: 20,
  },
  personInputs: {
    flexDirection: "row",
    flex: 1,
    gap: 8,
  },
  personInput: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  addPersonButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#3498db",
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
  },
  addPersonText: {
    fontSize: 16,
    color: "#3498db",
    marginLeft: 8,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e1e8ed",
    backgroundColor: "#f8f9fa",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#95a5a6",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#95a5a6",
    fontWeight: "500",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#3498db",
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },

  // Gallery Styles
  galleryContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  galleryCloseButton: {
    padding: 8,
  },
  galleryCounter: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  mainImageContainer: {
    flex: 1,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  navigationButtons: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  navButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailContainer: {
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingVertical: 10,
  },
  thumbnailList: {
    paddingHorizontal: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumbnail: {
    borderColor: "#3498db",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
  descriptionContainer: {
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 16,
  },
  descriptionText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },

  // Detail Dialog Styles
  detailContent: {
    padding: 20,
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#2c3e50",
  },

  // Notification Styles
  notification: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  notificationSuccess: {
    backgroundColor: "#27ae60",
  },
  notificationError: {
    backgroundColor: "#e74c3c",
  },
  notificationWarning: {
    backgroundColor: "#f39c12",
  },
  notificationInfo: {
    backgroundColor: "#3498db",
  },
  notificationText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 50,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
    marginRight: 10,
  },
  datePickerOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  datePickerModal: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
    maxWidth: 400,
    overflow: "hidden",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  datePickerCloseButton: {
    padding: 5,
  },
  datePickerContent: {
    padding: 15,
  },
  dateTimePicker: {
    width: "100%",
    height: 200,
  },
  datePickerActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#e1e8ed",
  },
  datePickerCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#95a5a6",
  },
  datePickerCancelText: {
    fontSize: 16,
    color: "#95a5a6",
    fontWeight: "500",
  },
  datePickerConfirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#3498db",
  },
  datePickerConfirmText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
});

export default ReservationTable;
