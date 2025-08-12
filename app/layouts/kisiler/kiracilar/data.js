import API_BASE_URL from "@/config/api";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
// Custom hook for Kiracilar data
export const useKiracilarData = () => {
  const [allTenantsData, setAllTenantsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchKiracilar = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchKiracilar();
  }, [fetchKiracilar]);

  return {
    allTenantsData,
    loading,
    error,
    fetchKiracilar,
  };
};

// Default export to fix Expo Router warnings
export default useKiracilarData;

// Function to fetch tenant details
export const fetchTenantDetails = async (tenantId, tenantName) => {
  try {
    const kontratResponse = await axios.get(
      `${API_BASE_URL}/kiraci_guncel_kontrat?Kiraci_ID=${tenantId}`
    );
    const kontratList = kontratResponse.data;

    if (!kontratList || kontratList.length === 0) {
      return [];
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

    return populatedDetails;
  } catch (err) {
    let errorMessage = "Kontrat bilgileri yüklenirken hata oluştu";
    if (err.response?.data?.detail) {
      errorMessage = err.response.data.detail;
    } else if (err.request) {
      errorMessage =
        "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
    }
    Alert.alert("Hata", errorMessage);
    throw err;
  }
};
