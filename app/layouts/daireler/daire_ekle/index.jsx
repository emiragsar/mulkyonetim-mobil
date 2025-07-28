import axios from "axios";
import React, { useEffect, useState } from "react";
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

const API_BASE_URL = "http://localhost:8000";

const DaireEkle = () => {
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [evSahibiModalVisible, setEvSahibiModalVisible] = useState(false);
  const [kiraciModalVisible, setKiraciModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    Kisa_Isim: "",
    Site: "",
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
    Kiralik: false,
    Satilik: false,
    Istenen_Kira: null,
    Istenen_Satis_Bedeli: null,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/users`);
        setUsers(response.data);
      } catch (err) {
        let errorMessage = "Kullanıcı listesi alınamadı";
        if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.request) {
          errorMessage =
            "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
        }
        setError(errorMessage);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

      const response = await axios.post(`${API_BASE_URL}/daire`, dataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.status === 201) {
        setSuccess("Daire başarıyla eklendi!");
        Alert.alert("Başarılı", "Daire başarıyla eklendi!");

        // Reset form
        setFormData({
          Kisa_Isim: "",
          Site: "",
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
          Kiralik: false,
          Satilik: false,
          Istenen_Kira: null,
          Istenen_Satis_Bedeli: null,
        });
      }
    } catch (err) {
      let errorMessage = "Daire eklenirken bir hata oluştu.";

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
  };

  const selectEvSahibi = (user) => {
    handleFieldChange("Ev_Sahibi_ID", user.id);
    setEvSahibiModalVisible(false);
  };

  const selectKiraci = (user) => {
    handleFieldChange("Guncel_Kiraci_ID", user.id);
    setKiraciModalVisible(false);
  };

  const getSelectedEvSahibi = () => {
    return users.find((user) => user.id === formData.Ev_Sahibi_ID);
  };

  const getSelectedKiraci = () => {
    return users.find((user) => user.id === formData.Guncel_Kiraci_ID);
  };

  const renderUserItem = ({ item }, onSelect) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
      <Text style={styles.modalItemText}>{`${item.Ad} ${item.Soyad}`}</Text>
    </TouchableOpacity>
  );

  const SwitchRow = ({ label, value, onValueChange }) => (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E0E0E0", true: "#2196F3" }}
        thumbColor={value ? "#FFFFFF" : "#F4F3F4"}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yeni Daire Ekle</Text>
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

        {/* Temel Bilgiler */}
        <Text style={styles.sectionTitle}>Temel Bilgiler</Text>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.inputLabel}>Kısa İsim</Text>
            <TextInput
              style={styles.input}
              value={formData.Kisa_Isim}
              onChangeText={(text) => handleFieldChange("Kisa_Isim", text)}
              placeholder="Kısa isim giriniz"
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.inputLabel}>Site</Text>
            <TextInput
              style={styles.input}
              value={formData.Site}
              onChangeText={(text) => handleFieldChange("Site", text)}
              placeholder="Site adı"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.thirdWidth}>
            <Text style={styles.inputLabel}>Blok</Text>
            <TextInput
              style={styles.input}
              value={formData.Blok}
              onChangeText={(text) => handleFieldChange("Blok", text)}
              placeholder="Blok"
            />
          </View>

          <View style={styles.thirdWidth}>
            <Text style={styles.inputLabel}>Daire No *</Text>
            <TextInput
              style={styles.input}
              value={formData.Daire}
              onChangeText={(text) => handleFieldChange("Daire", text)}
              placeholder="Daire No"
            />
          </View>

          <View style={styles.thirdWidth}>
            <Text style={styles.inputLabel}>Apartman</Text>
            <TextInput
              style={styles.input}
              value={formData.Apartman}
              onChangeText={(text) => handleFieldChange("Apartman", text)}
              placeholder="Apartman"
            />
          </View>
        </View>

        {/* Adres Bilgileri */}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Adres Bilgileri</Text>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.inputLabel}>Sokak</Text>
            <TextInput
              style={styles.input}
              value={formData.Sokak}
              onChangeText={(text) => handleFieldChange("Sokak", text)}
              placeholder="Sokak adı"
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.inputLabel}>Cadde</Text>
            <TextInput
              style={styles.input}
              value={formData.Cadde}
              onChangeText={(text) => handleFieldChange("Cadde", text)}
              placeholder="Cadde adı"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.thirdWidth}>
            <Text style={styles.inputLabel}>Mahalle</Text>
            <TextInput
              style={styles.input}
              value={formData.Mahalle}
              onChangeText={(text) => handleFieldChange("Mahalle", text)}
              placeholder="Mahalle"
            />
          </View>

          <View style={styles.thirdWidth}>
            <Text style={styles.inputLabel}>İlçe</Text>
            <TextInput
              style={styles.input}
              value={formData.Ilce}
              onChangeText={(text) => handleFieldChange("Ilce", text)}
              placeholder="İlçe"
            />
          </View>

          <View style={styles.thirdWidth}>
            <Text style={styles.inputLabel}>İl</Text>
            <TextInput
              style={styles.input}
              value={formData.Il}
              onChangeText={(text) => handleFieldChange("Il", text)}
              placeholder="İl"
            />
          </View>
        </View>

        {/* Sahip ve Kiracı Bilgileri */}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Sahip ve Kiracı Bilgileri</Text>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.inputLabel}>Ev Sahibi *</Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                !formData.Ev_Sahibi_ID && styles.pickerButtonError,
              ]}
              onPress={() => setEvSahibiModalVisible(true)}
              disabled={usersLoading}
            >
              {usersLoading ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <Text
                  style={
                    getSelectedEvSahibi()
                      ? styles.pickerButtonText
                      : styles.pickerPlaceholder
                  }
                >
                  {getSelectedEvSahibi()
                    ? `${getSelectedEvSahibi().Ad} ${
                        getSelectedEvSahibi().Soyad
                      }`
                    : "Ev sahibi seçiniz"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.inputLabel}>Güncel Kiracı</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setKiraciModalVisible(true)}
              disabled={usersLoading}
            >
              {usersLoading ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <Text
                  style={
                    getSelectedKiraci()
                      ? styles.pickerButtonText
                      : styles.pickerPlaceholder
                  }
                >
                  {getSelectedKiraci()
                    ? `${getSelectedKiraci().Ad} ${getSelectedKiraci().Soyad}`
                    : "Kiracı seçiniz"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Durum Bilgileri */}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Durum Bilgileri</Text>

        <View style={styles.switchContainer}>
          <SwitchRow
            label="Kiralık"
            value={formData.Kiralik}
            onValueChange={(value) => handleFieldChange("Kiralik", value)}
          />
          <SwitchRow
            label="Satılık"
            value={formData.Satilik}
            onValueChange={(value) => handleFieldChange("Satilik", value)}
          />
        </View>

        {/* Conditional Price Fields */}
        {(formData.Kiralik || formData.Satilik) && (
          <View style={styles.row}>
            {formData.Kiralik && (
              <View
                style={formData.Satilik ? styles.halfWidth : { width: "100%" }}
              >
                <Text style={styles.inputLabel}>İstenen Kira Bedeli</Text>
                <View style={styles.priceInputContainer}>
                  <TextInput
                    style={styles.priceInput}
                    value={formData.Istenen_Kira?.toString() || ""}
                    onChangeText={(text) =>
                      handleFieldChange("Istenen_Kira", text)
                    }
                    placeholder="Kira bedeli"
                    keyboardType="numeric"
                  />
                  <Text style={styles.currencySymbol}>₺</Text>
                </View>
              </View>
            )}

            {formData.Satilik && (
              <View
                style={formData.Kiralik ? styles.halfWidth : { width: "100%" }}
              >
                <Text style={styles.inputLabel}>İstenen Satış Bedeli</Text>
                <View style={styles.priceInputContainer}>
                  <TextInput
                    style={styles.priceInput}
                    value={formData.Istenen_Satis_Bedeli?.toString() || ""}
                    onChangeText={(text) =>
                      handleFieldChange("Istenen_Satis_Bedeli", text)
                    }
                    placeholder="Satış bedeli"
                    keyboardType="numeric"
                  />
                  <Text style={styles.currencySymbol}>₺</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveDaire}
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
            <Text style={styles.saveButtonText}>Daire Ekle</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Ev Sahibi Selection Modal */}
      <Modal
        visible={evSahibiModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEvSahibiModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ev Sahibi Seçin</Text>
              <TouchableOpacity
                onPress={() => setEvSahibiModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={users.filter((user) => user.Ev_Sahibi)}
              renderItem={(props) => renderUserItem(props, selectEvSahibi)}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <Text style={styles.emptyListText}>Ev sahibi bulunamadı</Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Kiracı Selection Modal */}
      <Modal
        visible={kiraciModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setKiraciModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kiracı Seçin</Text>
              <TouchableOpacity
                onPress={() => setKiraciModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={users.filter((user) => user.Kiraci)}
              renderItem={(props) => renderUserItem(props, selectKiraci)}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <Text style={styles.emptyListText}>Kiracı bulunamadı</Text>
              }
            />
            <TouchableOpacity
              style={styles.clearSelectionButton}
              onPress={() => {
                handleFieldChange("Guncel_Kiraci_ID", null);
                setKiraciModalVisible(false);
              }}
            >
              <Text style={styles.clearSelectionText}>Seçimi Temizle</Text>
            </TouchableOpacity>
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
    backgroundColor: "#2196F3",
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  thirdWidth: {
    width: "31%",
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
    minHeight: 48,
    justifyContent: "center",
  },
  pickerButtonError: {
    borderColor: "#F44336",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#333",
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    backgroundColor: "#FAFAFA",
    marginBottom: 16,
  },
  priceInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  currencySymbol: {
    paddingRight: 12,
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 20,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#90CAF9",
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
    width: "85%",
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
  emptyListText: {
    textAlign: "center",
    padding: 20,
    color: "#666",
    fontSize: 16,
  },
  clearSelectionButton: {
    backgroundColor: "#FF9800",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  clearSelectionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default DaireEkle;
