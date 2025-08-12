import API_BASE_URL from "@/config/api";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

// Ariza categories
export const ariza_kategori = [
  "Elektrik",
  "Su",
  "Dogalgaz",
  "Parke",
  "Fayans",
  "Pimapen",
  "Balkon",
  "Banyo",
  "Tuvalet",
  "Kombi",
  "Ocak",
  "Diğer",
];

// Initial form data
export const getInitialFormData = () => ({
  Daire_ID: null,
  Blok: "",
  Daire: "",
  Sokak: "",
  Cadde: "",
  Mahalle: "",
  Apartman: "",
  Ilce: "",
  Il: "",
  Ev_Sahibi_ID: null,
  Guncel_Kiraci_ID: null,
});

// Initial ariza item
export const getInitialArizaItem = () => ({
  Kisa_Ariza: "",
  Ariza_Aciklama: "",
  Usta_ID: null,
});

// Format date to readable string
export const formatDateToReadableString = (date) => {
  return new Date(date).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

// Custom hook for ArizaEkle data
export const useArizaEkleData = () => {
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [dairelerLoading, setDairelerLoading] = useState(false);
  const [ustalarLoading, setUstalarLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [daireler, setDaireler] = useState([]);
  const [ustalar, setUstalar] = useState([]);

  // Modal visibility states
  const [modalVisible, setModalVisible] = useState({
    daire: false,
    evSahibi: false,
    kiraci: false,
    usta: false,
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [arizaItems, setArizaItems] = useState([getInitialArizaItem()]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (err) {
      setError("Kullanıcı listesi alınamadı: " + err.message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Fetch daireler
  const fetchDaireler = useCallback(async () => {
    setDairelerLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/daire`);
      setDaireler(response.data);
    } catch (err) {
      setError("Daire listesi alınamadı: " + err.message);
    } finally {
      setDairelerLoading(false);
    }
  }, []);

  // Fetch ustalar
  const fetchUstalar = useCallback(async () => {
    setUstalarLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/usta`);
      setUstalar(response.data);
    } catch (err) {
      setError("Usta listesi alınamadı: " + err.message);
    } finally {
      setUstalarLoading(false);
    }
  }, []);

  // Add ariza item
  const addArizaItem = useCallback(() => {
    setArizaItems((prev) => [...prev, getInitialArizaItem()]);
  }, []);

  // Remove ariza item
  const removeArizaItem = useCallback((index) => {
    setArizaItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Get filtered ustalar based on ariza description
  const getFilteredUstalar = useCallback((arizaTanimi) => {
    if (!arizaTanimi) return ustalar;
    
    const lowerAriza = arizaTanimi.toLowerCase();
    return ustalar.filter((usta) => {
      const ustaAlan = usta.Alan?.toLowerCase() || "";
      return ustaAlan.includes(lowerAriza) || lowerAriza.includes(ustaAlan);
    });
  }, [ustalar]);

  // Handle ariza item change
  const handleArizaItemChange = useCallback((index, field, value) => {
    setArizaItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    const errors = [];

    if (!formData.Daire_ID) {
      errors.push("Daire seçimi gereklidir");
    }

    if (arizaItems.length === 0) {
      errors.push("En az bir arıza tanımı gereklidir");
    }

    for (let i = 0; i < arizaItems.length; i++) {
      const item = arizaItems[i];
      if (!item.Kisa_Ariza.trim()) {
        errors.push(`${i + 1}. arıza için kısa tanım gereklidir`);
      }
      if (!item.Ariza_Aciklama.trim()) {
        errors.push(`${i + 1}. arıza için açıklama gereklidir`);
      }
    }

    return errors;
  }, [formData.Daire_ID, arizaItems]);

  // Save ariza
  const handleSaveAriza = useCallback(async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert("Hata", errors.join("\n"));
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create ariza records for each item
      const arizaPromises = arizaItems.map(async (item) => {
        const arizaData = {
          Daire_ID: formData.Daire_ID,
          Bildiren_ID: formData.Guncel_Kiraci_ID || formData.Ev_Sahibi_ID,
          Ariza_Aciklama: item.Ariza_Aciklama,
          Kisa_Ariza: item.Kisa_Ariza,
          Usta_ID: item.Usta_ID,
          Ariza_Tarihi: new Date().toISOString(),
        };

        return axios.post(`${API_BASE_URL}/ariza`, arizaData);
      });

      await Promise.all(arizaPromises);

      setSuccess("Arızalar başarıyla eklendi!");
      
      // Reset form
      setFormData(getInitialFormData());
      setArizaItems([getInitialArizaItem()]);
    } catch (err) {
      let errorMessage = "Arıza eklenirken hata oluştu";
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.request) {
        errorMessage = "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
      } else {
        errorMessage = "Beklenmeyen bir hata oluştu: " + err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData, arizaItems, validateForm]);

  // Get daire option label
  const getDaireOptionLabel = useCallback((option) => {
    const addressParts = [
      option.Mahalle,
      option.Cadde,
      option.Sokak,
      option.Site || option.Apartman,
      option.Blok,
      `Daire ${option.Daire}`,
      option.Ilce,
      option.Il,
    ].filter(Boolean);
    return addressParts.join(" ");
  }, []);

  // Get usta option label
  const getUstaOptionLabel = useCallback((option) =>
    `${option.Ad} ${option.Soyad} (${option.Alan})`
  , []);

  // Handle field changes
  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchUsers();
    fetchDaireler();
    fetchUstalar();
  }, [fetchUsers, fetchDaireler, fetchUstalar]);

  // Initialize data
  useEffect(() => {
    fetchUsers();
    fetchDaireler();
    fetchUstalar();
  }, [fetchUsers, fetchDaireler, fetchUstalar]);

  return {
    loading,
    usersLoading,
    dairelerLoading,
    ustalarLoading,
    error,
    success,
    users,
    daireler,
    ustalar,
    modalVisible,
    formData,
    arizaItems,
    setModalVisible,
    handleFieldChange,
    addArizaItem,
    removeArizaItem,
    handleArizaItemChange,
    getFilteredUstalar,
    handleSaveAriza,
    getDaireOptionLabel,
    getUstaOptionLabel,
    handleRefresh,
    validateForm,
  };
};

// Default export to fix Expo Router warnings
export default useArizaEkleData; 