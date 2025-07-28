import axios from "axios";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE_URL = "http://192.168.1.107:8000";

const alan = [
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

const KisiEkle = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [alanModalVisible, setAlanModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    Ad: "",
    Soyad: "",
    TC_Kimlik: "",
    Adres: "",
    Telefon: "",
    Mail: "",
    Ev_Sahibi: false,
    Kiraci: false,
    Usta: false,
    Yatirimci: false,
    Admin: false,
    Kiraci_Skor: null,
    Usta_Skor: null,
    Alan: "",
    Isletme: "",
  });

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTCKimlikChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 11);
    handleFieldChange("TC_Kimlik", numericValue);
  };

  const validateForm = () => {
    if (!formData.Ad.trim()) {
      setError("Ad alanı zorunludur.");
      return false;
    }
    if (!formData.Soyad.trim()) {
      setError("Soyad alanı zorunludur.");
      return false;
    }
    if (formData.TC_Kimlik && formData.TC_Kimlik.toString().length !== 11) {
      setError("TC Kimlik numarası 11 haneli olmalıdır.");
      return false;
    }
    if (formData.Mail && !formData.Mail.includes("@")) {
      setError("Geçerli bir e-posta adresi giriniz.");
      return false;
    }
    return true;
  };

  const handleSavePerson = async () => {
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        TC_Kimlik: formData.TC_Kimlik ? parseInt(formData.TC_Kimlik) : null,
        Kiraci_Skor:
          formData.Kiraci_Skor === null || formData.Kiraci_Skor === ""
            ? null
            : parseFloat(formData.Kiraci_Skor),
        Usta_Skor:
          formData.Usta_Skor === null || formData.Usta_Skor === ""
            ? null
            : parseFloat(formData.Usta_Skor),
      };

      const response = await axios.post(`${API_BASE_URL}/user`, dataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.status === 201) {
        setSuccess("Kişi başarıyla eklendi!");
        Alert.alert("Başarılı", "Kişi başarıyla eklendi!");

        // Reset form
        setFormData({
          Ad: "",
          Soyad: "",
          TC_Kimlik: "",
          Adres: "",
          Telefon: "",
          Mail: "",
          Ev_Sahibi: false,
          Kiraci: false,
          Usta: false,
          Yatirimci: false,
          Admin: false,
          Kiraci_Skor: null,
          Usta_Skor: null,
          Alan: "",
          Isletme: "",
        });
      }
    } catch (err) {
      let errorMessage = "Kişi eklenirken bir hata oluştu.";

      if (err.response) {
        // Backend'den gelen hata
        if (err.response.data) {
          if (Array.isArray(err.response.data.detail)) {
            errorMessage =
              err.response.data.detail[0].msg || "Doğrulama hatası oluştu.";
          } else if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          }
        }
      } else if (err.request) {
        // Network hatası
        errorMessage =
          "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
      } else {
        // Diğer hatalar
        errorMessage = "Beklenmeyen bir hata oluştu: " + err.message;
      }

      setError(errorMessage);
      Alert.alert("Hata", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectAlan = (selectedAlan) => {
    handleFieldChange("Alan", selectedAlan);
    setAlanModalVisible(false);
  };

  const renderAlanItem = ({ item }) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => selectAlan(item)}>
      <Text style={styles.modalItemText}>{item}</Text>
    </TouchableOpacity>
  );

  const SwitchRow = ({ label, value, onValueChange }) => (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
        thumbColor={value ? "#FFFFFF" : "#F4F3F4"}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yeni Kişi Ekle</Text>
      </View>

      <View style={styles.content}>
        {/* Error/Success Messages */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        ) : null}

        {/* Kişisel Bilgiler */}
        <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.inputLabel}>Ad *</Text>
            <TextInput
              style={styles.input}
              value={formData.Ad}
              onChangeText={(text) => handleFieldChange("Ad", text)}
              placeholder="Ad giriniz"
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.inputLabel}>Soyad *</Text>
            <TextInput
              style={styles.input}
              value={formData.Soyad}
              onChangeText={(text) => handleFieldChange("Soyad", text)}
              placeholder="Soyad giriniz"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.inputLabel}>TC Kimlik Numarası</Text>
            <TextInput
              style={styles.input}
              value={formData.TC_Kimlik}
              onChangeText={handleTCKimlikChange}
              placeholder="TC Kimlik No"
              keyboardType="numeric"
              maxLength={11}
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.inputLabel}>Telefon</Text>
            <TextInput
              style={styles.input}
              value={formData.Telefon}
              onChangeText={(text) => handleFieldChange("Telefon", text)}
              placeholder="Telefon numarası"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>E-posta</Text>
        <TextInput
          style={styles.input}
          value={formData.Mail}
          onChangeText={(text) => handleFieldChange("Mail", text)}
          placeholder="E-posta adresi"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Adres</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.Adres}
          onChangeText={(text) => handleFieldChange("Adres", text)}
          placeholder="Adres bilgisi"
          multiline
          numberOfLines={3}
        />

        {/* Roller */}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Roller</Text>

        <View style={styles.switchContainer}>
          <SwitchRow
            label="Ev Sahibi"
            value={formData.Ev_Sahibi}
            onValueChange={(value) => handleFieldChange("Ev_Sahibi", value)}
          />
          <SwitchRow
            label="Kiracı"
            value={formData.Kiraci}
            onValueChange={(value) => handleFieldChange("Kiraci", value)}
          />
          <SwitchRow
            label="Usta"
            value={formData.Usta}
            onValueChange={(value) => handleFieldChange("Usta", value)}
          />
          <SwitchRow
            label="Yatırımcı"
            value={formData.Yatirimci}
            onValueChange={(value) => handleFieldChange("Yatirimci", value)}
          />
          <SwitchRow
            label="Admin"
            value={formData.Admin}
            onValueChange={(value) => handleFieldChange("Admin", value)}
          />
        </View>

        {/* Mesleki Bilgiler */}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Mesleki Bilgiler</Text>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.inputLabel}>Alan</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setAlanModalVisible(true)}
            >
              <Text
                style={
                  formData.Alan
                    ? styles.pickerButtonText
                    : styles.pickerPlaceholder
                }
              >
                {formData.Alan || "Çalışma alanı seçin"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.inputLabel}>İşletme</Text>
            <TextInput
              style={styles.input}
              value={formData.Isletme}
              onChangeText={(text) => handleFieldChange("Isletme", text)}
              placeholder="Çalıştığı işletme"
            />
          </View>
        </View>

        {/* Puanlama */}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Puanlama</Text>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.inputLabel}>Kiracı Skoru</Text>
            <TextInput
              style={styles.input}
              value={formData.Kiraci_Skor?.toString() || ""}
              onChangeText={(text) => handleFieldChange("Kiraci_Skor", text)}
              placeholder="0-5 arası"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.inputLabel}>Usta Skoru</Text>
            <TextInput
              style={styles.input}
              value={formData.Usta_Skor?.toString() || ""}
              onChangeText={(text) => handleFieldChange("Usta_Skor", text)}
              placeholder="0-5 arası"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSavePerson}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={[styles.saveButtonText, { marginLeft: 10 }]}>
                Kaydediliyor...
              </Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Kişi Ekle</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Alan Selection Modal */}
      <Modal
        visible={alanModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAlanModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Çalışma Alanı Seçin</Text>
              <TouchableOpacity
                onPress={() => setAlanModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={alan}
              renderItem={renderAlanItem}
              keyExtractor={(item) => item}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
    backgroundColor: "white",
    margin: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: "#E8F5E8",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  successText: {
    color: "#2E7D32",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 16,
    color: "#333",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  switchContainer: {
    marginVertical: 10,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    padding: 12,
    backgroundColor: "#FAFAFA",
    marginBottom: 16,
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#333",
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 20,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "80%",
    maxHeight: "70%",
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 20,
    color: "#666",
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
});

export default KisiEkle;
