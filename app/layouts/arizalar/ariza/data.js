import API_BASE_URL from "@/config/api";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

// Utility functions
export const buildDaireAddress = (daire) => {
  return `${daire.Mahalle ?? ""} ${daire.Cadde ?? ""} ${daire.Sokak ?? ""} ${
    (daire.Site || daire.Apartman) ?? ""
  } ${daire.Blok ?? ""} ${daire.Daire ?? ""} ${daire.Ilce ?? ""} ${
    daire.Il ?? ""
  }`.trim();
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// Custom hook for Ariza data
export const useArizaTableData = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageGalleryItems, setImageGalleryItems] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [currentAriza, setCurrentAriza] = useState(null);
  const [ustas, setUstas] = useState([]);

  const getUserName = async (user_id) => {
    if (!user_id) return "Bilinmiyor";
    try {
      const response = await axios.get(`${API_BASE_URL}/user`, {
        params: { user_id },
      });
      const user = response.data;
      return `${user.Ad} ${user.Soyad}`;
    } catch (error) {
      console.error(`Error fetching user with ID ${user_id}:`, error);
      return "Bilinmiyor";
    }
  };

  const handleViewPhotos = async (arizaId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/ariza_fotograf?Ariza_ID=${arizaId}`
      );
      const galleryItems = res.data.map((photo) => ({
        uri: photo.Url,
        description: `${photo.Fotograf_Aciklama} - ${photo.Tarih}`,
      }));

      setImageGalleryItems(galleryItems);
      setShowGallery(true);
    } catch (error) {
      console.error("Error fetching ariza photos:", error);
    }
  };

  const handleSolveAriza = (arizaId) => {
    const row = rows.find((r) => r.id === arizaId);
    setCurrentAriza(row);
    setShowSolutionModal(true);
  };

  // Updated to receive the updated ariza data
  const handleSuccess = useCallback((updatedAriza) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === updatedAriza.id
          ? {
              ...row,
              durum: updatedAriza.durum,
              cozen_usta: updatedAriza.cozen_usta,
              ilgilenen_usta: updatedAriza.ilgilenen_usta,
              cozum_tarihi: updatedAriza.cozum_tarihi,
              fiyat: updatedAriza.fiyat,
              sorumlu: updatedAriza.sorumlu,
              basariyla_cozuldu: updatedAriza.basariyla_cozuldu,
              durumText: updatedAriza.durum ? "Çözüldü" : "Beklemede",
            }
          : row
      )
    );
  }, []);

  const handleCloseSolutionModal = () => {
    setShowSolutionModal(false);
    setCurrentAriza(null);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [arizaRes, daireRes, ustasRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/ariza`),
        axios.get(`${API_BASE_URL}/daire`),
        axios.get(`${API_BASE_URL}/usta`),
      ]);

      const arizaList = arizaRes.data;
      const daireList = daireRes.data;
      const ustasList = ustasRes.data;

      setUstas(ustasList);

      const daireAddressMap = {};
      daireList.forEach((daire) => {
        daireAddressMap[daire.Daire_ID] = buildDaireAddress(daire);
      });

      const enrichedRows = await Promise.all(
        arizaList.map(async (item) => {
          const arizaSahibi = await getUserName(item.Ariza_Olusturan_ID);
          const cozenUsta = item.Cozen_Usta_ID
            ? await getUserName(item.Cozen_Usta_ID)
            : "-";
          const ilgilenenUsta = item.Ilgilenen_Usta
            ? await getUserName(item.Ilgilenen_Usta)
            : "-";

          return {
            id: item.Ariza_ID,
            ariza_olusturan: arizaSahibi,
            daire_adres: daireAddressMap[item.Daire_ID] ?? "Adres bulunamadı",
            ariza_tarihi: item.Ariza_Tarihi ?? "-",
            ariza_aciklama: item.Ariza_Aciklama ?? "-",
            fotograflar: item.Ariza_ID,
            ilgilenen_usta: ilgilenenUsta,
            sorumlu: item.Sorumlu ?? "-",
            fiyat: item.Fiyat ? `${item.Fiyat} ₺` : "-",
            durum: item.Basariyla_Cozuldu,
            durumText: item.Basariyla_Cozuldu ? "Çözüldü" : "Beklemede",
            cozen_usta: cozenUsta,
            cozum_tarihi: formatDate(item.Cozum_Tarihi),
            basariyla_cozuldu: item.Basariyla_Cozuldu,
            coz: item.Ariza_ID,
          };
        })
      );

      setRows(enrichedRows);
    } catch (err) {
      let errorMessage = "Arıza listesi yüklenirken hata oluştu";
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    rows,
    loading,
    error,
    imageGalleryItems,
    showGallery,
    currentImageIndex,
    showSolutionModal,
    currentAriza,
    ustas,
    handleViewPhotos,
    handleSolveAriza,
    handleCloseSolutionModal,
    handleSuccess,
    setShowGallery,
    setCurrentImageIndex,
    refetch: fetchData,
  };
};

// Default export to fix Expo Router warnings
export default useArizaTableData;
