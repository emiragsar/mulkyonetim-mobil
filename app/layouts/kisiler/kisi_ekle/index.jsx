import DashboardLayout from "@/app/components/dashboardlayout";
import axios from "axios";
import React, { useState } from "react";
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
import MDInput from "@/app/components/MDInput";
import MDButton from "@/app/components/MDButton";
import API_BASE_URL from "@/config/api";
import SelectionModal from "@/app/components/SelectionModal";

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
    <DashboardLayout>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.blueHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Yeni Kişi Ekle</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
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
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <MDInput
                    size="small"
                    value={formData.Ad}
                    onChangeText={(text) => handleFieldChange("Ad", text)}
                    placeholder="Ad giriniz"
                  />
                </View>

                <View style={styles.inputHalf}>
                  <MDInput
                    size="small"
                    value={formData.Soyad}
                    onChangeText={(text) => handleFieldChange("Soyad", text)}
                    placeholder="Soyad giriniz"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <MDInput
                    size="small"
                    value={formData.TC_Kimlik}
                    onChangeText={handleTCKimlikChange}
                    placeholder="TC Kimlik No"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>

                <View style={styles.inputHalf}>
                  <MDInput
                    size="small"
                    value={formData.Telefon}
                    onChangeText={(text) => handleFieldChange("Telefon", text)}
                    placeholder="Telefon numarası"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <MDInput
                size="small"
                value={formData.Mail}
                onChangeText={(text) => handleFieldChange("Mail", text)}
                placeholder="E-posta adresi"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <MDInput
                size="small"
                value={formData.Adres}
                onChangeText={(text) => handleFieldChange("Adres", text)}
                placeholder="Adres bilgisi"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Roller */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Roller</Text>

              <View style={styles.switchContainer}>
                <SwitchRow
                  label="Ev Sahibi"
                  value={formData.Ev_Sahibi}
                  onValueChange={(value) =>
                    handleFieldChange("Ev_Sahibi", value)
                  }
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
                  onValueChange={(value) =>
                    handleFieldChange("Yatirimci", value)
                  }
                />
                <SwitchRow
                  label="Admin"
                  value={formData.Admin}
                  onValueChange={(value) => handleFieldChange("Admin", value)}
                />
              </View>
            </View>

            {/* Mesleki Bilgiler */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Mesleki Bilgiler</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <SelectionModal
                    title="Çalışma Alanı Seçin"
                    placeholder="Çalışma alanı seçin"
                    value={formData.Alan}
                    data={alan}
                    onSelect={(value) => handleFieldChange("Alan", value)}
                  />
                </View>

                <View style={styles.inputHalf}>
                  <MDInput
                    size="small"
                    value={formData.Isletme}
                    onChangeText={(text) => handleFieldChange("Isletme", text)}
                    placeholder="Çalıştığı İşletme"
                  />
                </View>
              </View>
            </View>

            {/* Puanlama */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Puanlama</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <MDInput
                    size="small"
                    value={formData.Kiraci_Skor?.toString() || ""}
                    onChangeText={(text) =>
                      handleFieldChange("Kiraci_Skor", text)
                    }
                    placeholder="Kiracı Skoru"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.inputHalf}>
                  <MDInput
                    size="small"
                    value={formData.Usta_Skor?.toString() || ""}
                    onChangeText={(text) =>
                      handleFieldChange("Usta_Skor", text)
                    }
                    placeholder="Usta Skoru"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {/* Save Button */}
            <MDButton
              variant="contained"
              onPress={handleSavePerson}
              loading={loading}
              color="success"
              textColor="white"
              sx={{
                width: "100%",
                marginTop: 24,
              }}
            >
              Kişi Ekle
            </MDButton>
          </View>
        </View>
      </View>
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
    backgroundColor: "#4CAF50",
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
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  inputHalf: {
    flex: 0.48,
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
});

export default KisiEkle;
