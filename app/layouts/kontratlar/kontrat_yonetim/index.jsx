import DashboardLayout from "@/app/components/dashboardlayout";
import API_BASE_URL from "@/config/api";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Custom hook for Kontrat Yönetim data
const useKontratYonetimData = () => {
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

  // Initialize empty contract form
  const emptyKontrat = {
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
  };

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
  const handleEvSahibiChange = (evSahibiId) => {
    setSelectedEvSahibi(evSahibiId);
    setSelectedDaire("");
    setCurrentKontrat(null);
    setError("");
    setSuccess("");

    if (
      evSahibiId &&
      evSahibiId !== "" &&
      evSahibiId !== undefined &&
      evSahibiId !== null
    ) {
      // Filter daireler by ev sahibi
      const filtered = daireler.filter((daire) => {
        const daireEvSahibiId = String(daire.Ev_Sahibi_ID);
        const selectedId = String(evSahibiId);
        return daireEvSahibiId === selectedId;
      });

      setFilteredDaireler(filtered);
    } else {
      // Show all daireler if no ev sahibi selected
      setFilteredDaireler(daireler);
    }
  };

  // Handle daire selection
  const handleDaireChange = async (daireId) => {
    setSelectedDaire(daireId);
    setError("");
    setSuccess("");

    if (daireId) {
      try {
        setLoading(true);

        // Fetch contract for selected daire
        const kontratRes = await axios.get(
          `${API_BASE_URL}/kontrat?Daire_ID=${daireId}`
        );

        if (kontratRes.data && kontratRes.data.length > 0) {
          // Contract exists
          setCurrentKontrat(kontratRes.data[0]);
          setIsNewKontrat(false);
        } else {
          // No contract exists, prepare for new contract
          const selectedDaireInfo = daireler.find(
            (d) => d.Daire_ID === parseInt(daireId)
          );
          const newKontrat = {
            ...emptyKontrat,
            Daire_ID: parseInt(daireId),
            Ev_Sahibi_ID: selectedDaireInfo?.Ev_Sahibi_ID || "",
          };
          setCurrentKontrat(newKontrat);
          setIsNewKontrat(true);
        }
      } catch (error) {
        console.error("Error fetching contract:", error);
        setError("Kontrat bilgileri yüklenirken hata oluştu");
        Alert.alert("Hata", "Kontrat bilgileri yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentKontrat(null);
    }
  };

  // Handle form field changes
  const handleFieldChange = (fieldName, value) => {
    setCurrentKontrat((prev) => {
      const updated = {
        ...prev,
        [fieldName]: value,
      };

      if (fieldName === "Toplam_Geciken_Odeme") {
        const numericValue = parseFloat(value);
        updated.Geciken_Odeme = numericValue > 0;
      }

      return updated;
    });
  };

  // Handle contract save/update
  const handleSaveKontrat = async () => {
    if (!currentKontrat) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (isNewKontrat) {
        // Create new contract
        const response = await axios.post(
          `${API_BASE_URL}/kontrat`,
          currentKontrat
        );
        setSuccess("Kontrat başarıyla oluşturuldu!");
        setCurrentKontrat(response.data);
        setIsNewKontrat(false);
        Alert.alert("Başarılı", "Kontrat başarıyla oluşturuldu!");
      } else {
        // Update existing contract
        await axios.put(
          `${API_BASE_URL}/kontrat/${currentKontrat.Kontrat_ID}`,
          currentKontrat
        );
        setSuccess("Kontrat başarıyla güncellendi!");
        Alert.alert("Başarılı", "Kontrat başarıyla güncellendi!");
      }
    } catch (error) {
      console.error("Error saving contract:", error);
      const errorMessage =
        "Kontrat kaydedilirken hata oluştu: " +
        (error.response?.data?.detail || error.message);
      setError(errorMessage);
      Alert.alert("Hata", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get daire address string
  const getDaireAddress = (daire) => {
    if (!daire) return "";
    return `${daire.Mahalle || ""} ${daire.Cadde || ""} ${daire.Sokak || ""} ${
      daire.Site || daire.Apartman || ""
    } ${daire.Blok || ""} ${daire.Daire || ""} ${daire.Ilce || ""} ${
      daire.Il || ""
    }`.trim();
  };

  // Get user name
  const getUserName = (userId) => {
    const user = kiracilar.find((k) => k.User_ID === userId);
    return user ? `${user.Ad} ${user.Soyad}` : "";
  };

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    evSahipleri,
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
    setError,
    setSuccess,
  };
};

// Input Component
const InputField = ({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  placeholder,
  multiline = false,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.textInput, multiline && styles.multilineInput]}
      value={String(value || "")}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor="#999"
      multiline={multiline}
    />
  </View>
);

// Yeni Custom Select Component
const CustomSelect = ({
  label,
  selectedValue,
  onValueChange,
  items,
  placeholder = "Seçiniz...",
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find((item) => item.value === selectedValue);
  const displayText = selectedItem ? selectedItem.label : placeholder;

  const handleSelect = (value) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[styles.selectText, !selectedItem && styles.placeholderText]}
        >
          {displayText}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[{ label: placeholder, value: "" }, ...items]}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedValue === item.value && styles.selectedItem,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedValue === item.value && styles.selectedItemText,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedValue === item.value && (
                    <Ionicons name="checkmark" size={20} color="#3498db" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Switch Component
const SwitchField = ({ label, value, onValueChange }) => (
  <View style={styles.switchContainer}>
    <Text style={styles.switchLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#767577", true: "#3498db" }}
      thumbColor={value ? "#fff" : "#f4f3f4"}
    />
  </View>
);

// Alert Component
const AlertComponent = ({ type, message, onClose }) => {
  if (!message) return null;

  return (
    <View
      style={[
        styles.alert,
        type === "success" ? styles.alertSuccess : styles.alertError,
      ]}
    >
      <Text style={styles.alertText}>{message}</Text>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.alertCloseButton}>
          <Ionicons name="close" size={16} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const KontratYonetim = () => {
  const {
    evSahipleri,
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
    setError,
    setSuccess,
  } = useKontratYonetimData();

  const handleRefresh = () => {
    // Refresh logic here if needed
  };

  if (loading && !currentKontrat) {
    return (
      <DashboardLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
        </View>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <View style={styles.container}>
        {/* Selection Section */}
        <View style={styles.headerSection}>
          <View style={styles.blueHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Kontratları Yönet</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefresh}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionContent}>
            <View style={styles.selectRow}>
              <View style={styles.selectHalf}>
                <CustomSelect
                  label="Ev Sahibi Seç"
                  selectedValue={selectedEvSahibi}
                  onValueChange={handleEvSahibiChange}
                  items={evSahipleri.map((owner) => ({
                    label: `${owner.Ad} ${owner.Soyad}`,
                    value: owner.id,
                  }))}
                  placeholder="Opsiyonel"
                />
              </View>
              <View style={styles.selectHalf}>
                <CustomSelect
                  label="Daire Seç"
                  selectedValue={selectedDaire}
                  onValueChange={handleDaireChange}
                  items={filteredDaireler.map((daire) => ({
                    label: getDaireAddress(daire),
                    value: daire.Daire_ID,
                  }))}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Contract Form Section */}
        {currentKontrat && (
          <View style={styles.headerSection}>
            <View
              style={[
                styles.blueHeader,
                isNewKontrat ? styles.successHeader : styles.warningHeader,
              ]}
            >
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>
                  {isNewKontrat ? "Yeni Kontrat Oluştur" : "Kontrat Düzenle"}
                </Text>
              </View>
            </View>

            <View style={styles.sectionContent}>
              {/* Alert Messages */}
              <AlertComponent
                type="error"
                message={error}
                onClose={() => setError("")}
              />
              <AlertComponent
                type="success"
                message={success}
                onClose={() => setSuccess("")}
              />

              {/* Basic Contract Info */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <CustomSelect
                    label="Kiracı"
                    selectedValue={currentKontrat.Kiraci_ID}
                    onValueChange={(value) =>
                      handleFieldChange("Kiraci_ID", value)
                    }
                    items={kiracilar.map((kiraci) => ({
                      label: `${kiraci.Ad} ${kiraci.Soyad}`,
                      value: kiraci.id,
                    }))}
                    placeholder="Kiracı Seçiniz"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Aylık Kira Bedeli"
                    value={currentKontrat.Sozlesme_Aylik_Bedel}
                    onChangeText={(value) =>
                      handleFieldChange("Sozlesme_Aylik_Bedel", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Yıllık Kira Bedeli"
                    value={currentKontrat.Sozlesme_Yillik_Bedel}
                    onChangeText={(value) =>
                      handleFieldChange("Sozlesme_Yillik_Bedel", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Ödeme Günü"
                    value={currentKontrat.Odeme_Gunu}
                    onChangeText={(value) =>
                      handleFieldChange("Odeme_Gunu", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Contract Dates */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sözleşme Tarihleri</Text>
              </View>

              <View style={styles.threeColumnRow}>
                <View style={styles.thirdWidth}>
                  <InputField
                    label="Başlangıç Günü"
                    value={currentKontrat.Sozlesme_Baslangic_Gun}
                    onChangeText={(value) =>
                      handleFieldChange("Sozlesme_Baslangic_Gun", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.thirdWidth}>
                  <InputField
                    label="Başlangıç Ayı"
                    value={currentKontrat.Sozlesme_Baslangic_Ay}
                    onChangeText={(value) =>
                      handleFieldChange("Sozlesme_Baslangic_Ay", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.thirdWidth}>
                  <InputField
                    label="Başlangıç Yılı"
                    value={currentKontrat.Sozlesme_Baslangic_Yil}
                    onChangeText={(value) =>
                      handleFieldChange("Sozlesme_Baslangic_Yil", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.threeColumnRow}>
                <View style={styles.thirdWidth}>
                  <InputField
                    label="Bitiş Günü"
                    value={currentKontrat.Sozlesme_Bitis_Gun}
                    onChangeText={(value) =>
                      handleFieldChange("Sozlesme_Bitis_Gun", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.thirdWidth}>
                  <InputField
                    label="Bitiş Ayı"
                    value={currentKontrat.Sozlesme_Bitis_Ay}
                    onChangeText={(value) =>
                      handleFieldChange("Sozlesme_Bitis_Ay", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.thirdWidth}>
                  <InputField
                    label="Bitiş Yılı"
                    value={currentKontrat.Sozlesme_Bitis_Yil}
                    onChangeText={(value) =>
                      handleFieldChange("Sozlesme_Bitis_Yil", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Banking Info */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Banka Bilgileri</Text>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Banka"
                    value={currentKontrat.Banka}
                    onChangeText={(value) => handleFieldChange("Banka", value)}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Banka IBAN"
                    value={currentKontrat.Banka_IBAN}
                    onChangeText={(value) =>
                      handleFieldChange("Banka_IBAN", value)
                    }
                  />
                </View>
              </View>

              {/* Financial Details */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mali Bilgiler</Text>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Depozito"
                    value={currentKontrat.Depozito}
                    onChangeText={(value) =>
                      handleFieldChange("Depozito", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Aylık Şirket Payı"
                    value={currentKontrat.Aylik_Sirket_Payi}
                    onChangeText={(value) =>
                      handleFieldChange("Aylik_Sirket_Payi", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Yıllık Şirket Payı"
                    value={currentKontrat.Yillik_Sirket_Payi}
                    onChangeText={(value) =>
                      handleFieldChange("Yillik_Sirket_Payi", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Şirket Komisyonu"
                    value={currentKontrat.Sirket_Komisyonu}
                    onChangeText={(value) =>
                      handleFieldChange("Sirket_Komisyonu", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Toplam Geciken Ödeme"
                    value={currentKontrat.Toplam_Geciken_Odeme}
                    onChangeText={(value) =>
                      handleFieldChange("Toplam_Geciken_Odeme", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Toplam Fazla Ödeme"
                    value={currentKontrat.Toplam_Fazla_Odeme}
                    onChangeText={(value) =>
                      handleFieldChange("Toplam_Fazla_Odeme", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Toplam Ödeme"
                    value={currentKontrat.Toplam_Odeme}
                    onChangeText={(value) =>
                      handleFieldChange("Toplam_Odeme", value)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Son Ödeme Yapılan Ay"
                    value={currentKontrat.Son_Odeme_Yapilan_Ay}
                    onChangeText={(value) =>
                      handleFieldChange("Son_Odeme_Yapilan_Ay", value)
                    }
                  />
                </View>
              </View>

              <InputField
                label="Sonraki Ödeme"
                value={currentKontrat.Sonraki_Odeme}
                onChangeText={(value) =>
                  handleFieldChange("Sonraki_Odeme", value)
                }
              />

              {/* Boolean Fields */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Durum Bilgileri</Text>
              </View>

              <View style={styles.switchRow}>
                <SwitchField
                  label="Kira Garantisi"
                  value={currentKontrat.Kira_Garantisi || false}
                  onValueChange={(value) =>
                    handleFieldChange("Kira_Garantisi", value)
                  }
                />
                <SwitchField
                  label="Şirket Komisyon Ödemesi"
                  value={currentKontrat.Sirket_Komisyon_Odemesi || false}
                  onValueChange={(value) =>
                    handleFieldChange("Sirket_Komisyon_Odemesi", value)
                  }
                />
              </View>

              <View style={styles.switchRow}>
                <SwitchField
                  label="Sözleşme Aktif"
                  value={currentKontrat.Sozlesme_Durumu_Aktif || false}
                  onValueChange={(value) =>
                    handleFieldChange("Sozlesme_Durumu_Aktif", value)
                  }
                />
              </View>

              {/* Action Button */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.saveButton, loading && styles.disabledButton]}
                  onPress={handleSaveKontrat}
                  disabled={loading}
                >
                  {loading && (
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                      style={styles.buttonLoader}
                    />
                  )}
                  <Text style={styles.saveButtonText}>
                    {loading
                      ? "Kaydediliyor..."
                      : isNewKontrat
                      ? "Kontrat Oluştur"
                      : "Kontratı Güncelle"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
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
  successHeader: {
    backgroundColor: "#27ae60",
  },
  warningHeader: {
    backgroundColor: "#f39c12",
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
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  sectionContent: {
    padding: 20,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  // Perfect alignment row layouts
  selectRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  selectHalf: {
    flex: 1,
    marginHorizontal: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 5,
  },
  threeColumnRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  thirdWidth: {
    flex: 1,
    marginHorizontal: 5,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    flexWrap: "wrap",
  },
  // Input Field Styles
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#fff",
    height: 45,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  // Custom Select Styles
  selectButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 45,
  },
  selectText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    maxHeight: "70%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedItem: {
    backgroundColor: "#f8f9fa",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  selectedItemText: {
    color: "#3498db",
    fontWeight: "600",
  },
  // Switch Field Styles
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginHorizontal: 5,
    marginBottom: 10,
    minWidth: "45%",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  // Alert Styles
  alert: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  alertSuccess: {
    backgroundColor: "#27ae60",
  },
  alertError: {
    backgroundColor: "#e74c3c",
  },
  alertText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  alertCloseButton: {
    padding: 4,
  },
  // Button Styles
  buttonContainer: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#3498db",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: "#95a5a6",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonLoader: {
    marginRight: 10,
  },
});

export default KontratYonetim;
