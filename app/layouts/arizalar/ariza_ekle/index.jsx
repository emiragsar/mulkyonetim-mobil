import DashboardLayout from "@/app/components/dashboardlayout";
import API_BASE_URL from "@/config/api";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const ariza_kategori = [
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

const getInitialFormData = () => ({
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

const getInitialArizaItem = () => ({
  Kisa_Ariza: "",
  Ariza_Aciklama: "",
  Usta_ID: null,
});

function formatDateToReadableString(date) {
  return new Date(date).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// Custom Select Component
const CustomSelect = ({
  label,
  selectedValue,
  onValueChange,
  items,
  placeholder = "Seçiniz...",
  disabled = false,
  helperText = "",
  required = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find((item) =>
    typeof item === "string"
      ? item === selectedValue
      : item.value === selectedValue
  );

  const displayText = selectedItem
    ? typeof selectedItem === "string"
      ? selectedItem
      : selectedItem.label
    : placeholder;

  const handleSelect = (value) => {
    onValueChange(value);
    setModalVisible(false);
  };

  const processedItems = items.map((item) =>
    typeof item === "string" ? { label: item, value: item } : item
  );

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, required && styles.requiredLabel]}>
        {label} {required && "*"}
      </Text>
      <TouchableOpacity
        style={[styles.selectButton, disabled && styles.disabledSelect]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectText,
            !selectedItem && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
        >
          {displayText}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? "#ccc" : "#666"}
        />
      </TouchableOpacity>

      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}

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
              data={processedItems}
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

// Input Field Component
const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  disabled = false,
  required = false,
  multiline = false,
}) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.inputLabel, required && styles.requiredLabel]}>
      {label} {required && "*"}
    </Text>
    <TextInput
      style={[
        styles.textInput,
        disabled && styles.disabledInput,
        multiline && styles.multilineInput,
      ]}
      value={String(value || "")}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#999"
      editable={!disabled}
      multiline={multiline}
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

const ArizaEkle = () => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [daireler, setDaireler] = useState([]);
  const [selectedDaire, setSelectedDaire] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());
  const [arizaItems, setArizaItems] = useState([getInitialArizaItem()]);

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [usersRes, dairelerRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users`),
        fetch(`${API_BASE_URL}/daire`),
      ]);
      const usersData = await usersRes.json();
      const dairelerData = await dairelerRes.json();
      setUsers(Array.isArray(usersData) ? usersData : []);
      setDaireler(Array.isArray(dairelerData) ? dairelerData : []);
    } catch (err) {
      const errorMessage = "Gerekli veriler yüklenemedi: " + err.message;
      setError(errorMessage);
      Alert.alert("Hata", errorMessage);
      // Ensure arrays are set even on error
      setUsers([]);
      setDaireler([]);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedDaire) {
      setFormData((prev) => ({
        ...prev,
        Daire_ID: selectedDaire.Daire_ID,
        Blok: selectedDaire.Blok || "",
        Daire: selectedDaire.Daire || "",
        Sokak: selectedDaire.Sokak || "",
        Cadde: selectedDaire.Cadde || "",
        Mahalle: selectedDaire.Mahalle || "",
        Apartman: selectedDaire.Apartman || selectedDaire.Site || "",
        Ilce: selectedDaire.Ilce || "",
        Il: selectedDaire.Il || "",
        Ev_Sahibi_ID: selectedDaire.Ev_Sahibi_ID,
        Guncel_Kiraci_ID: selectedDaire.Guncel_Kiraci_ID,
      }));
    }
  }, [selectedDaire]);

  const addArizaItem = () => {
    if (arizaItems.length < 5) {
      setArizaItems((prev) => [...prev, getInitialArizaItem()]);
    }
  };

  const removeArizaItem = (index) => {
    if (arizaItems.length > 1) {
      setArizaItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const getFilteredUstalar = (arizaTanimi) => {
    if (!arizaTanimi) return [];

    return Array.isArray(users)
      ? users.filter(
          (user) =>
            user.Usta === true &&
            user.Alan &&
            user.Alan.toLowerCase() === arizaTanimi.toLowerCase()
        )
      : [];
  };

  const handleArizaItemChange = (index, field, value) => {
    setArizaItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          if (field === "Kisa_Ariza") {
            return { ...item, [field]: value, Usta_ID: null };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const validateForm = () => {
    if (!selectedDaire) {
      setError("Lütfen bir daire seçin.");
      return false;
    }
    for (let i = 0; i < arizaItems.length; i++) {
      if (!arizaItems[i].Kisa_Ariza.trim()) {
        setError(`${i + 1}. Arıza Tanımı alanı zorunludur.`);
        return false;
      }
    }
    return true;
  };

  const handleSaveAriza = async () => {
    setError("");
    setSuccess("");
    if (!validateForm()) return;
    setLoading(true);

    try {
      const now = new Date();
      const promises = arizaItems.map(async (item) => {
        const dataToSend = {
          Daire_ID: formData.Daire_ID,
          Ariza_Kategori: item.Kisa_Ariza,
          Ariza_Aciklama: item.Ariza_Aciklama,
          Ilgilenen_Usta: item.Usta_ID,
          Ariza_Tarihi: formatDateToReadableString(now),
        };
        const response = await fetch(`${API_BASE_URL}/ariza`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || "Arıza eklenirken bir hata oluştu."
          );
        }
        return response.json();
      });
      await Promise.all(promises);
      const successMessage = `${arizaItems.length} arıza kaydı başarıyla oluşturuldu!`;
      setSuccess(successMessage);
      Alert.alert("Başarılı", successMessage);
      setFormData(getInitialFormData());
      setSelectedDaire(null);
      setArizaItems([getInitialArizaItem()]);
    } catch (err) {
      const errorMessage = "Sunucu hatası: " + err.message;
      setError(errorMessage);
      Alert.alert("Hata", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDaireOptionLabel = (option) => {
    const address = [
      option.Mahalle,
      option.Cadde,
      option.Sokak,
      option.Site || option.Apartman,
      option.Blok,
      `Daire: ${option.Daire}`,
    ]
      .filter(Boolean)
      .join(" ");
    return address || `Daire ID: ${option.Daire_ID}`;
  };

  const getUstaOptionLabel = (option) =>
    `${option.Ad} ${option.Soyad} (${option.Alan})`;

  const isDaireSelected = !!selectedDaire;

  const daireOptions = Array.isArray(daireler)
    ? daireler.map((daire) => ({
        label: getDaireOptionLabel(daire),
        value: daire.Daire_ID,
        data: daire,
      }))
    : [];

  const handleRefresh = () => {
    fetchData();
  };

  if (dataLoading) {
    return (
      <DashboardLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f39c12" />
          <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
        </View>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.warningHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Arıza Ekle</Text>
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

            {/* Daire Selection */}
            <CustomSelect
              label="Arıza Bildirilecek Daireyi Seçin"
              selectedValue={selectedDaire?.Daire_ID}
              onValueChange={(value) => {
                const daire = Array.isArray(daireler)
                  ? daireler.find((d) => d.Daire_ID === value)
                  : null;
                setSelectedDaire(daire || null);
              }}
              items={daireOptions}
              placeholder="Daire seçiniz..."
              required={true}
            />

            {/* Divider */}
            <View style={styles.divider} />

            {/* Ariza Details Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Arıza Detayları</Text>
            </View>

            {arizaItems.map((item, index) => (
              <View key={index}>
                <View style={styles.arizaItemHeader}>
                  <Text style={styles.arizaItemTitle}>{index + 1}. Arıza</Text>
                  {arizaItems.length > 1 && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removeArizaItem(index)}
                    >
                      <Ionicons name="trash" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.arizaItemContent}>
                  <View style={styles.row}>
                    <View style={styles.thirdWidth}>
                      <CustomSelect
                        label="Arıza Tanımı"
                        selectedValue={item.Kisa_Ariza}
                        onValueChange={(value) =>
                          handleArizaItemChange(index, "Kisa_Ariza", value)
                        }
                        items={ariza_kategori}
                        required={true}
                      />
                    </View>
                    <View style={styles.thirdWidth}>
                      <InputField
                        label="Arıza Açıklaması"
                        value={item.Ariza_Aciklama}
                        onChangeText={(value) =>
                          handleArizaItemChange(index, "Ariza_Aciklama", value)
                        }
                        placeholder="Detay girin..."
                        multiline={true}
                      />
                    </View>
                    <View style={styles.thirdWidth}>
                      <CustomSelect
                        label="Usta Seçin"
                        selectedValue={item.Usta_ID}
                        onValueChange={(value) =>
                          handleArizaItemChange(index, "Usta_ID", value)
                        }
                        items={getFilteredUstalar(item.Kisa_Ariza).map(
                          (usta) => ({
                            label: getUstaOptionLabel(usta),
                            value: usta.id,
                          })
                        )}
                        disabled={!item.Kisa_Ariza}
                        helperText={
                          item.Kisa_Ariza
                            ? `${item.Kisa_Ariza} uzmanı ustalar`
                            : "Önce arıza tanımını seçin"
                        }
                      />
                    </View>
                  </View>
                </View>

                {index < arizaItems.length - 1 && (
                  <View style={styles.itemDivider} />
                )}
              </View>
            ))}

            {/* Add Ariza Button */}
            <View style={styles.addButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  arizaItems.length >= 5 && styles.disabledButton,
                ]}
                onPress={addArizaItem}
                disabled={arizaItems.length >= 5}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color="#fff"
                  style={styles.addIcon}
                />
                <Text style={styles.addButtonText}>
                  Arıza Ekle ({arizaItems.length}/5)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Daire ve Ev Sahibi Bilgileri */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Daire ve Ev Sahibi Bilgileri
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.thirdWidth}>
                <InputField
                  label="Blok"
                  value={formData.Blok}
                  disabled={true}
                />
              </View>
              <View style={styles.thirdWidth}>
                <InputField
                  label="Daire No"
                  value={formData.Daire}
                  disabled={true}
                />
              </View>
              <View style={styles.thirdWidth}>
                <InputField
                  label="Apartman"
                  value={formData.Apartman}
                  disabled={true}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="Sokak"
                  value={formData.Sokak}
                  disabled={true}
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Cadde"
                  value={formData.Cadde}
                  disabled={true}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.thirdWidth}>
                <InputField
                  label="Mahalle"
                  value={formData.Mahalle}
                  disabled={true}
                />
              </View>
              <View style={styles.thirdWidth}>
                <InputField
                  label="İlçe"
                  value={formData.Ilce}
                  disabled={true}
                />
              </View>
              <View style={styles.thirdWidth}>
                <InputField label="İl" value={formData.Il} disabled={true} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="Ev Sahibi"
                  value={(() => {
                    const user = Array.isArray(users)
                      ? users.find((u) => u.id === formData.Ev_Sahibi_ID)
                      : null;
                    return user ? `${user.Ad} ${user.Soyad}` : "";
                  })()}
                  disabled={true}
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Güncel Kiracı"
                  value={(() => {
                    const user = Array.isArray(users)
                      ? users.find((u) => u.id === formData.Guncel_Kiraci_ID)
                      : null;
                    return user ? `${user.Ad} ${user.Soyad}` : "Yok";
                  })()}
                  disabled={true}
                />
              </View>
            </View>

            {/* Save Button */}
            <View style={styles.saveButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (loading || !isDaireSelected) && styles.disabledButton,
                ]}
                onPress={handleSaveAriza}
                disabled={loading || !isDaireSelected}
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
                    : `${arizaItems.length} Arıza Kaydı Oluştur`}
                </Text>
              </TouchableOpacity>
            </View>
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
  warningHeader: {
    backgroundColor: "#f39c12",
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
    marginTop: 10,
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
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 20,
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 15,
  },
  // Layout Styles
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 5,
  },
  thirdWidth: {
    flex: 1,
    marginHorizontal: 5,
    justifyContent: "flex-start",
  },
  // Input Styles
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  requiredLabel: {
    color: "#e74c3c",
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
    minHeight: 45,
  },
  multilineInput: {
    minHeight: 60, // 80 yerine 50
    textAlignVertical: "top",
    paddingTop: 8,
    fontSize: 13,
  },
  disabledInput: {
    backgroundColor: "#f8f9fa",
    color: "#6c757d",
  },
  helperText: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 5,
    fontStyle: "italic",
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
    minHeight: 45,
  },
  disabledSelect: {
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef",
  },
  selectText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  disabledText: {
    color: "#6c757d",
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
  // Ariza Item Styles
  arizaItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  arizaItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#ffebee",
  },
  arizaItemContent: {
    marginBottom: 10,
  },
  // Add Button Styles
  addButtonContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  addButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  // Save Button Styles
  saveButtonContainer: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#f39c12",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 250,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: "#95a5a6",
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonLoader: {
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
});

export default ArizaEkle;
