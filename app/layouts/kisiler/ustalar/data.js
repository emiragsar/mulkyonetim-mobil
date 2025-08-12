import API_BASE_URL from "@/config/api";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

// Custom hook for Ustalar data
export const useUstalarData = () => {
  const [allUstalarData, setAllUstalarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUstalar = useCallback(async () => {
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
  }, []);

  const handleRefresh = useCallback(() => {
    fetchUstalar();
  }, [fetchUstalar]);

  const getSkorColor = useCallback((skor) => {
    if (skor === "N/A") return "#666"; // Gri
    if (skor <= 2) return "#F44336"; // error - kırmızı
    if (skor <= 3) return "#FF9800"; // warning - turuncu
    if (skor <= 4) return "#2196F3"; // info - mavi
    return "#4CAF50"; // success - yeşil
  }, []);

  useEffect(() => {
    fetchUstalar();
  }, [fetchUstalar]);

  return {
    allUstalarData,
    loading,
    error,
    handleRefresh,
    getSkorColor,
  };
};

// Default export to fix Expo Router warnings
export default useUstalarData; 