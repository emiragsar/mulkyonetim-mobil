import API_BASE_URL from "@/config/api";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
// Custom hook for EvSahipleri data
export const useEvSahipleriData = () => {
  const [allOwnersData, setAllOwnersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvSahipleri = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchEvSahipleri();
  }, [fetchEvSahipleri]);

  return {
    allOwnersData,
    loading,
    error,
    fetchEvSahipleri,
  };
};

// Default export to fix Expo Router warnings
export default useEvSahipleriData;

// Function to fetch owner details
export const fetchOwnerDetails = async (ownerId, ownerName) => {
  try {
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

    return detailsWithTenants;
  } catch (err) {
    let errorMessage = "Daire bilgileri yüklenirken hata oluştu";

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
