import API_BASE_URL from "@/config/api";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

// Custom hook for TeknikTakip data
export const useTeknikTakipData = () => {
  const [allTeknikTakipData, setAllTeknikTakipData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [imageGalleryItems, setImageGalleryItems] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [arizalar, setArizalar] = useState([]);
  const [selectedDaireId, setSelectedDaireId] = useState(null);
  const [arizalarModalVisible, setArizalarModalVisible] = useState(false);
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

  const fetchTeknikTakipDaireler = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [daireRes, userMap] = await Promise.all([
        axios.get(`${API_BASE_URL}/daire`),
        fetchAllUsers(),
      ]);

      // Filter apartments that are under technical monitoring
      const teknikTakipDaires = daireRes.data.filter(
        (item) => item.Teknik_Takip === true
      );

      const enrichedRows = teknikTakipDaires.map((item) => {
        const evSahibi = userMap[item.Ev_Sahibi_ID];
        const evSahibiAd = evSahibi
          ? `${evSahibi.Ad} ${evSahibi.Soyad}`
          : "Bilinmiyor";

        const evSahibiDetail = evSahibi
          ? `Ad Soyad: ${evSahibi.Ad} ${evSahibi.Soyad}\nAdres: ${
              evSahibi.Adres || "-"
            }\nTelefon: ${evSahibi.Telefon || "-"}\nSkor: ${
              evSahibi.Kiraci_Skor ?? "-"
            }`
          : "Bilinmiyor";

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
          id: item.Daire_ID,
          adres: adresText,
          evSahibi: evSahibiAd,
          evSahibiDetail,
          fotograflar: item.Daire_ID,
          belgeler: item.Daire_ID,
          arizalar: item.Daire_ID,
        };
      });

      setAllTeknikTakipData(enrichedRows);
    } catch (err) {
      let errorMessage = "Teknik takip daireleri yüklenirken hata oluştu";
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

  const handleViewArizalar = useCallback(async (daireId) => {
    try {
      const [res, userMap] = await Promise.all([
        axios.get(`${API_BASE_URL}/ariza?Daire_ID=${daireId}`),
        fetchAllUsers(),
      ]);

      if (res.data.length === 0) {
        Alert.alert("Bilgi", "Bu daireye ait arıza bulunamadı.");
        return;
      }

      const enrichedArizalar = res.data.map((item) => {
        const bildiren = userMap[item.Bildiren_ID];
        const cozumleyen = item.Cozumleyen_ID
          ? userMap[item.Cozumleyen_ID]
          : null;

        const bildirenAd = bildiren
          ? `${bildiren.Ad} ${bildiren.Soyad}`
          : "Bilinmiyor";
        const cozumleyenAd = cozumleyen
          ? `${cozumleyen.Ad} ${cozumleyen.Soyad}`
          : "Henüz atanmamış";

        return {
          id: item.Ariza_ID,
          bildiren: bildirenAd,
          aciklama: item.Ariza_Aciklama || "-",
          tarih: item.Ariza_Tarihi
            ? new Date(item.Ariza_Tarihi).toLocaleDateString("tr-TR")
            : "-",
          durum: item.Cozuldu ? "Çözüldü" : "Beklemede",
          cozumleyen: cozumleyenAd,
          cozumTarihi: item.Cozum_Tarihi
            ? new Date(item.Cozum_Tarihi).toLocaleDateString("tr-TR")
            : "-",
        };
      });

      setArizalar(enrichedArizalar);
      setSelectedDaireId(daireId);
      setArizalarModalVisible(true);
    } catch (error) {
      console.error("Error fetching arizalar:", error);
      Alert.alert("Hata", "Arıza bilgileri yüklenirken hata oluştu.");
    }
  }, [fetchAllUsers]);

  const handleShowDetail = useCallback((detail, title) => {
    setSelectedDetail(detail);
    setDetailModalTitle(title);
    setDetailModalVisible(true);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchTeknikTakipDaireler();
  }, [fetchTeknikTakipDaireler]);

  useEffect(() => {
    fetchTeknikTakipDaireler();
  }, [fetchTeknikTakipDaireler]);

  return {
    allTeknikTakipData,
    loading,
    error,
    imageGalleryItems,
    showGallery,
    currentImageIndex,
    arizalar,
    selectedDaireId,
    arizalarModalVisible,
    detailModalVisible,
    selectedDetail,
    detailModalTitle,
    handleViewPhotos,
    handleViewDocuments,
    handleViewArizalar,
    handleShowDetail,
    handleRefresh,
    setShowGallery,
    setCurrentImageIndex,
    setArizalarModalVisible,
    setDetailModalVisible,
  };
};

// Default export to fix Expo Router warnings
export default useTeknikTakipData; 