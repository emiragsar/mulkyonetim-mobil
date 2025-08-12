import API_BASE_URL from "@/config/api";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

// Empty contract form
export const getEmptyKontrat = () => ({
  Daire_ID: "",
  Ev_Sahibi_ID: "",
  Kiraci_ID: "",
  Sozlesme_Baslangic_Gun: "",
  Sozlesme_Baslangic_Ay: "",
  Sozlesme_Baslangic_Yil: "",
  Sozlesme_Bitis_Gun: "",
  Sozlesme_Bitis_Ay: "",
  Sozlesme_Bitis_Yil: "",
  Sozlesme_Aylik_Bedel: "",
  Sozlesme_Yillik_Bedel: "",
  Banka: "",
  Banka_IBAN: "",
  Kira_Garantisi: false,
  Geciken_Odeme: false,
  Toplam_Geciken_Odeme: 0,
  Toplam_Fazla_Odeme: 0,
  Son_Odeme_Yapilan_Ay: "",
  Toplam_Odeme: 0,
  Odeme_Gunu: "",
  Sonraki_Odeme: "",
  Depozito: 0,
  Aylik_Sirket_Payi: 0,
  Yillik_Sirket_Payi: 0,
  Sirket_Komisyonu: 0,
  Sirket_Komisyon_Odemesi: false,
  Sozlesme_Durumu_Aktif: true,
});

// Custom hook for Kontrat Yönetim data
export const useKontratYonetimData = () => {
  const [evSahipleri, setEvSahipleri] = useState([]);
  const [daireler, setDaireler] = useState([]);
  const [filteredDaireler, setFilteredDaireler] = useState([]);
  const [kiracilar, setKiracilar] = useState([]);
  const [selectedEvSahibi, setSelectedEvSahibi] = useState("");
  const [selectedDaire, setSelectedDaire] = useState("");
  const [currentKontrat, setCurrentKontrat] = useState(null);
  const [isNewKontrat, setIsNewKontrat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all users to get ev sahipleri and kiracilar
      const usersRes = await axios.get(`${API_BASE_URL}/users`);
      const users = usersRes.data;

      // Filter ev sahipleri (assuming they have a role or property ownership)
      const sahipler = users.filter((user) => user.Ev_Sahibi === true);
      setEvSahipleri(sahipler);

      // Set all users as potential kiracilar
      setKiracilar(users);

      // Fetch all daireler
      const dairelerRes = await axios.get(`${API_BASE_URL}/daire`);
      setDaireler(dairelerRes.data);
      setFilteredDaireler(dairelerRes.data);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError("Veri yüklenirken hata oluştu");
      Alert.alert("Hata", "Veri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle ev sahibi selection
  const handleEvSahibiChange = useCallback((evSahibiId) => {
    setSelectedEvSahibi(evSahibiId);
    setSelectedDaire("");
    setCurrentKontrat(null);
    setError("");
    setSuccess("");

    if (evSahibiId) {
      const filtered = daireler.filter((daire) => daire.Ev_Sahibi_ID === evSahibiId);
      setFilteredDaireler(filtered);
    } else {
      setFilteredDaireler(daireler);
    }
  }, [daireler]);

  // Handle daire selection
  const handleDaireChange = useCallback(async (daireId) => {
    setSelectedDaire(daireId);
    setCurrentKontrat(null);
    setError("");
    setSuccess("");

    if (daireId) {
      try {
        // Fetch existing contract for this daire
        const response = await axios.get(`${API_BASE_URL}/kiraci_guncel_kontrat?Daire_ID=${daireId}`);
        
        if (response.data && response.data.length > 0) {
          const existingKontrat = response.data[0];
          setCurrentKontrat(existingKontrat);
          setIsNewKontrat(false);
        } else {
          // Create new contract form
          const newKontrat = {
            ...getEmptyKontrat(),
            Daire_ID: daireId,
            Ev_Sahibi_ID: selectedEvSahibi,
          };
          setCurrentKontrat(newKontrat);
          setIsNewKontrat(true);
        }
      } catch (error) {
        console.error("Error fetching contract:", error);
        setError("Kontrat bilgileri yüklenirken hata oluştu");
      }
    }
  }, [selectedEvSahibi]);

  // Handle field changes
  const handleFieldChange = useCallback((fieldName, value) => {
    if (currentKontrat) {
      setCurrentKontrat((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    }
  }, [currentKontrat]);

  // Save contract
  const handleSaveKontrat = useCallback(async () => {
    if (!currentKontrat) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const kontratData = {
        ...currentKontrat,
        Sozlesme_Aylik_Bedel: parseFloat(currentKontrat.Sozlesme_Aylik_Bedel) || 0,
        Sozlesme_Yillik_Bedel: parseFloat(currentKontrat.Sozlesme_Yillik_Bedel) || 0,
        Toplam_Geciken_Odeme: parseFloat(currentKontrat.Toplam_Geciken_Odeme) || 0,
        Toplam_Fazla_Odeme: parseFloat(currentKontrat.Toplam_Fazla_Odeme) || 0,
        Toplam_Odeme: parseFloat(currentKontrat.Toplam_Odeme) || 0,
        Depozito: parseFloat(currentKontrat.Depozito) || 0,
        Aylik_Sirket_Payi: parseFloat(currentKontrat.Aylik_Sirket_Payi) || 0,
        Yillik_Sirket_Payi: parseFloat(currentKontrat.Yillik_Sirket_Payi) || 0,
        Sirket_Komisyonu: parseFloat(currentKontrat.Sirket_Komisyonu) || 0,
      };

      if (isNewKontrat) {
        await axios.post(`${API_BASE_URL}/kontrat`, kontratData);
        setSuccess("Kontrat başarıyla oluşturuldu!");
      } else {
        await axios.put(`${API_BASE_URL}/kontrat/${currentKontrat.id}`, kontratData);
        setSuccess("Kontrat başarıyla güncellendi!");
      }
    } catch (error) {
      console.error("Error saving contract:", error);
      let errorMessage = "Kontrat kaydedilirken hata oluştu";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentKontrat, isNewKontrat]);

  // Get daire address
  const getDaireAddress = useCallback((daire) => {
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
    return addressParts.join(" ");
  }, []);

  // Get user name
  const getUserName = useCallback((userId) => {
    const user = kiracilar.find((u) => u.id === userId);
    return user ? `${user.Ad} ${user.Soyad}` : "Bilinmiyor";
  }, [kiracilar]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Initialize data
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    evSahipleri,
    daireler,
    filteredDaireler,
    kiracilar,
    selectedEvSahibi,
    selectedDaire,
    currentKontrat,
    isNewKontrat,
    loading,
    error,
    success,
    handleEvSahibiChange,
    handleDaireChange,
    handleFieldChange,
    handleSaveKontrat,
    getDaireAddress,
    getUserName,
    handleRefresh,
    setError,
    setSuccess,
  };
};

// Default export to fix Expo Router warnings
export default useKontratYonetimData; 