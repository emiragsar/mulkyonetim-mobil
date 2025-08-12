import API_BASE_URL from "@/config/api";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

// Custom hook for TahliyeEdilecekler data
export const useTahliyeEdileceklerData = () => {
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

  const fetchDaireler = useCallback(async () => {
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

        return {
          id: item.id,
          adres: adresText,
          evSahibi: evSahibiAd,
          kiraci: kiraciAd,
          evSahibiDetail,
          kiraciDetail,
          fotograflar: item.id,
          belgeler: item.id,
          eskiKiracilar: item.id,
        };
      });

      setAllDaireData(enrichedRows);
    } catch (err) {
      let errorMessage = "Tahliye edilecek daireler yüklenirken hata oluştu";
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
  }, [fetchAllUsers]);

  const handleViewPhotos = useCallback(async (daireId) => {
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
  }, []);

  const handleViewDocuments = useCallback(async (daireId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/daire_belge?Daire_ID=${daireId}`
      );
      if (response.data.length === 0) {
        Alert.alert("Bilgi", "Bu daireye ait belge bulunamadı.");
        return;
      }
      const galleryItems = response.data.map((doc) => ({
        uri: doc.Url,
        description: `${doc.Belge_Aciklama || ""} - ${doc.Tarih || ""}`,
      }));
      setImageGalleryItems(galleryItems);
      setCurrentImageIndex(0);
      setShowGallery(true);
    } catch (error) {
      console.error("Error fetching daire documents:", error);
      Alert.alert("Hata", "Belgeler yüklenirken hata oluştu.");
    }
  }, []);

  const handleViewOldTenants = useCallback(async (daireId) => {
    try {
      const [res, userMap] = await Promise.all([
        axios.get(`${API_BASE_URL}/kiraci_eski_kontrat?Daire_ID=${daireId}`),
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
  }, [fetchAllUsers]);

  const handleShowDetail = useCallback((detail, title) => {
    setSelectedDetail(detail);
    setDetailModalTitle(title);
    setDetailModalVisible(true);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchDaireler();
  }, [fetchDaireler]);

  useEffect(() => {
    fetchDaireler();
  }, [fetchDaireler]);

  return {
    allDaireData,
    loading,
    error,
    imageGalleryItems,
    showGallery,
    currentImageIndex,
    oldTenants,
    selectedDaireId,
    oldTenantsModalVisible,
    detailModalVisible,
    selectedDetail,
    detailModalTitle,
    handleViewPhotos,
    handleViewDocuments,
    handleViewOldTenants,
    handleShowDetail,
    handleRefresh,
    setShowGallery,
    setCurrentImageIndex,
    setOldTenantsModalVisible,
    setDetailModalVisible,
  };
};

// Default export to fix Expo Router warnings
export default useTahliyeEdileceklerData; 