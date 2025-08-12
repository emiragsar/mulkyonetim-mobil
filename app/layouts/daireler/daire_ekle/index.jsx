import DashboardLayout from "@/app/components/dashboardlayout";
import API_BASE_URL from "@/config/api";
import SelectionModal from "@/app/components/SelectionModal";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MDButton from "@/app/components/MDButton";
import MDInput from "@/app/components/MDInput";

const DaireEkle = () => {
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState({
    il: true,
    mahalle: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [adresVeri, setAdresVeri] = useState([]);
  const [mahalleler, setMahalleler] = useState([]);

  // Modal visibility states
  const [modalVisible, setModalVisible] = useState({
    il: false,
    ilce: false,
    mahalle: false,
    evSahibi: false,
    kiraci: false,
  });

  const [formData, setFormData] = useState({
    Kisa_Isim: "",
    Site: "",
    Blok: "",
    Daire: "",
    Il: "",
    Ilce: "",
    Mahalle: "",
    Sokak: "",
    Cadde: "",
    Apartman: "",
    Ev_Sahibi_ID: null,
    Guncel_Kiraci_ID: null,
    Kiralik: false,
    Satilik: false,
    Istenen_Kira: null,
    Istenen_Satis_Bedeli: null,
    KisaDonemli_Kiralik: false,
  });

  useEffect(() => {
    const fetchIlveIlceler = async () => {
      try {
        const res = await fetch("https://turkiyeapi.dev/api/v1/provinces", {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data && data.data) {
          const ilveilce = data.data.map((sehir) => ({
            il: sehir.name,
            ilceler: sehir.districts.map((ilce) => ilce.name),
          }));
          setAdresVeri(ilveilce);
        }
      } catch (err) {
        console.error("İl/İlçe API hatası:", err);
        setError("Adres verileri yüklenemedi.");
      } finally {
        setAddressLoading((prev) => ({ ...prev, il: false }));
      }
    };
    fetchIlveIlceler();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/users`);
        setUsers(response.data);
      } catch (err) {
        setError("Kullanıcı listesi alınamadı: " + err.message);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchMahalleler = async () => {
      if (!formData.Il || !formData.Ilce) {
        setMahalleler([]);
        return;
      }
      setAddressLoading((prev) => ({ ...prev, mahalle: true }));
      try {
        const res = await fetch(
          `https://turkiyeapi.dev/api/v1/neighborhoods?province=${formData.Il}&district=${formData.Ilce}`,
          { method: "GET", headers: { Accept: "application/json" } }
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data && data.data) {
          const mahalleListesi = data.data.map((mahalle) => mahalle.name);
          setMahalleler(mahalleListesi);
        }
      } catch (err) {
        console.error("Mahalle API hatası:", err);
        setMahalleler([]);
      } finally {
        setAddressLoading((prev) => ({ ...prev, mahalle: false }));
      }
    };

    fetchMahalleler();
  }, [formData.Il, formData.Ilce]);

  const formatNumberForDisplay = (value) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }
    const stringValue = String(value).replace(/[^0-9]/g, "");
    if (stringValue === "") {
      return "";
    }
    return new Intl.NumberFormat("tr-TR").format(Number(stringValue));
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePriceChange = (field, value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      [field]: numericValue === "" ? null : numericValue,
    }));
  };

  const handleIlChange = (newValue) => {
    setFormData((prev) => ({
      ...prev,
      Il: newValue || "",
      Ilce: "",
      Mahalle: "",
    }));
    setMahalleler([]);
  };

  const handleIlceChange = (newValue) => {
    setFormData((prev) => ({
      ...prev,
      Ilce: newValue || "",
      Mahalle: "",
    }));
  };

  // Modal açma/kapama helper fonksiyonları
  const openModal = (type) => {
    setModalVisible((prev) => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModalVisible((prev) => ({ ...prev, [type]: false }));
  };

  const validateForm = () => {
    if (!formData.Daire.trim()) {
      setError("Daire No alanı zorunludur.");
      return false;
    }

    if (!formData.Ev_Sahibi_ID) {
      setError("Ev Sahibi seçimi zorunludur.");
      return false;
    }

    if (
      !formData.Site &&
      !formData.Cadde &&
      !formData.Sokak &&
      !formData.Mahalle
    ) {
      setError(
        "En az bir adres bilgisi (Site, Cadde, Sokak veya Mahalle) girilmelidir."
      );
      return false;
    }

    return true;
  };

  const handleSaveDaire = async () => {
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        Istenen_Kira: formData.Istenen_Kira
          ? parseFloat(formData.Istenen_Kira)
          : null,
        Istenen_Satis_Bedeli: formData.Istenen_Satis_Bedeli
          ? parseFloat(formData.Istenen_Satis_Bedeli)
          : null,
      };

      const response = await axios.post(`${API_BASE_URL}/daire`, dataToSend);

      setSuccess("Daire başarıyla eklendi!");
      Alert.alert("Başarılı", "Daire başarıyla eklendi!");

      // Form'u sıfırla
      setFormData({
        Kisa_Isim: "",
        Site: "",
        Blok: "",
        Daire: "",
        Il: "",
        Ilce: "",
        Mahalle: "",
        Sokak: "",
        Cadde: "",
        Apartman: "",
        Ev_Sahibi_ID: null,
        Guncel_Kiraci_ID: null,
        Kiralik: false,
        Satilik: false,
        Istenen_Kira: null,
        Istenen_Satis_Bedeli: null,
        KisaDonemli_Kiralik: false,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || "Daire eklenirken bir hata oluştu.";
      setError(errorMessage);
      Alert.alert("Hata", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcılar için özel render item

  const ilcelerForSelectedIl =
    adresVeri.find((data) => data.il === formData.Il)?.ilceler || [];
  const evSahipleri = users.filter((user) => user.Ev_Sahibi);
  const kiracilar = users.filter((user) => user.Kiraci);

  return (
    <DashboardLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.blueHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Yeni Daire Ekle</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            {/* Error/Success Messages */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => setError("")}>
                  <Ionicons name="close" size={20} color="#C62828" />
                </TouchableOpacity>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{success}</Text>
                <TouchableOpacity onPress={() => setSuccess("")}>
                  <Ionicons name="close" size={20} color="#2E7D32" />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Temel Bilgiler */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Temel Bilgiler</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <MDInput
                    size="small "
                    value={formData.Kisa_Isim}
                    onChangeText={(value) =>
                      handleFieldChange("Kisa_Isim", value)
                    }
                    placeholder="Kısa isim giriniz"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <MDInput
                    size="small "
                    value={formData.Site}
                    onChangeText={(value) => handleFieldChange("Site", value)}
                    placeholder="Site adı giriniz"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputThird}>
                  <MDInput
                    size="small "
                    value={formData.Blok}
                    onChangeText={(value) => handleFieldChange("Blok", value)}
                    placeholder="Blok"
                  />
                </View>
                <View style={styles.inputThird}>
                  <MDInput
                    size="small "
                    value={formData.Daire}
                    onChangeText={(value) => handleFieldChange("Daire", value)}
                    placeholder="Daire no**"
                  />
                </View>

                <View style={styles.inputThird}>
                  <MDInput
                    size="small "
                    value={formData.Apartman}
                    onChangeText={(value) =>
                      handleFieldChange("Apartman", value)
                    }
                    placeholder="Apartman"
                  />
                </View>
              </View>
            </View>

            {/* Adres Bilgileri */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Adres Bilgileri</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputThird}>
                  <SelectionModal
                    title="İl Seçin"
                    placeholder="İl seçin"
                    value={formData.Il}
                    data={adresVeri.map((data) => data.il)}
                    onSelect={handleIlChange}
                    loading={addressLoading.il}
                  />
                </View>

                <View style={styles.inputThird}>
                  <SelectionModal
                    title="İlçe Seçin"
                    placeholder="İlçe seçin"
                    value={formData.Ilce}
                    data={ilcelerForSelectedIl}
                    onSelect={handleIlceChange}
                    disabled={!formData.Il}
                    emptyMessage="Önce il seçiniz"
                  />
                </View>

                <View style={styles.inputThird}>
                  <SelectionModal
                    title="Mahalle Seçin"
                    placeholder="Mahalle seçin"
                    value={formData.Mahalle}
                    data={mahalleler}
                    onSelect={(value) => handleFieldChange("Mahalle", value)}
                    disabled={!formData.Ilce}
                    loading={addressLoading.mahalle}
                    emptyMessage="Önce il ve ilçe seçiniz"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <MDInput
                    size="small "
                    value={formData.Cadde}
                    onChangeText={(value) => handleFieldChange("Cadde", value)}
                    placeholder="Cadde adı"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <MDInput
                    size="small "
                    value={formData.Sokak}
                    onChangeText={(value) => handleFieldChange("Sokak", value)}
                    placeholder="Sokak adı"
                  />
                </View>
              </View>
            </View>

            {/* Sahip ve Kiracı Bilgileri */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Sahip ve Kiracı Bilgileri</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <SelectionModal
                    title="Ev Sahibi Seçin"
                    placeholder="Ev sahibi seçin**"
                    value={users.find((u) => u.id === formData.Ev_Sahibi_ID)}
                    data={evSahipleri}
                    onSelect={(value) =>
                      handleFieldChange("Ev_Sahibi_ID", value.id)
                    }
                    loading={usersLoading}
                    required={true}
                    displayFormat={(user) => `${user.Ad} ${user.Soyad}`}
                  />
                </View>

                <View style={styles.inputHalf}>
                  <SelectionModal
                    title="Kiracı Seçin"
                    placeholder="Kiracı seçin"
                    value={users.find(
                      (u) => u.id === formData.Guncel_Kiraci_ID
                    )}
                    data={kiracilar}
                    onSelect={(value) =>
                      handleFieldChange("Guncel_Kiraci_ID", value.id)
                    }
                    loading={usersLoading}
                    displayFormat={(user) => `${user.Ad} ${user.Soyad}`}
                  />
                </View>
              </View>
            </View>

            {/* Durum Bilgileri */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Durum Bilgileri</Text>

              <View style={styles.switchRow}>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Kiralık</Text>
                  <Switch
                    value={formData.Kiralik}
                    onValueChange={(value) =>
                      handleFieldChange("Kiralik", value)
                    }
                    thumbColor={formData.Kiralik ? "#3498db" : "#f4f3f4"}
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                  />
                </View>

                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Satılık</Text>
                  <Switch
                    value={formData.Satilik}
                    onValueChange={(value) =>
                      handleFieldChange("Satilik", value)
                    }
                    thumbColor={formData.Satilik ? "#3498db" : "#f4f3f4"}
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                  />
                </View>

                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Kısa Dönemli Kiralık</Text>
                  <Switch
                    value={formData.KisaDonemli_Kiralik}
                    onValueChange={(value) =>
                      handleFieldChange("KisaDonemli_Kiralik", value)
                    }
                    thumbColor={
                      formData.KisaDonemli_Kiralik ? "#3498db" : "#f4f3f4"
                    }
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                  />
                </View>
              </View>

              {/* Fiyat Alanları */}
              {(formData.Kiralik || formData.KisaDonemli_Kiralik) && (
                <View style={styles.inputContainer}>
                  <MDInput
                    size="small"
                    value={formatNumberForDisplay(formData.Istenen_Kira)}
                    onChangeText={(value) =>
                      handlePriceChange("Istenen_Kira", value)
                    }
                    placeholder="İstenen Kira Bedeli (₺)"
                    keyboardType="numeric"
                  />
                </View>
              )}

              {formData.Satilik && (
                <View style={styles.inputContainer}>
                  <MDInput
                    size="small"
                    value={formatNumberForDisplay(
                      formData.Istenen_Satis_Bedeli
                    )}
                    onChangeText={(value) =>
                      handlePriceChange("Istenen_Satis_Bedeli", value)
                    }
                    placeholder="İstenen Satış Bedeli (₺)"
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>

            {/* Save Button */}
            <MDButton
              title="Daire Ekle"
              onPress={handleSaveDaire}
              loading={loading}
              color="info"
              textColor="white"
              sx={{
                width: "100%",
                marginTop: 24,
              }}
            >
              Daire Ekle
            </MDButton>
          </View>
        </View>
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
    backgroundColor: "#3498db",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  formContainer: {
    padding: 20,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
    flex: 1,
  },
  successContainer: {
    backgroundColor: "#E8F5E8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  successText: {
    color: "#2E7D32",
    fontSize: 14,
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  inputHalf: {
    flex: 0.48,
  },
  inputThird: {
    flex: 0.31,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },

  switchRow: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  switchLabel: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  currencySymbol: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 12,
    fontWeight: "500",
  },
});

export default DaireEkle;
