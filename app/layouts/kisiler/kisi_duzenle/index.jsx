import DashboardLayout from "@/app/components/dashboardlayout";
import axios from "axios";
import React, { useState, useEffect } from "react";
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

import API_BASE_URL from "@/config/api";

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

const KisiDuzenle = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [alanModalVisible, setAlanModalVisible] = useState(false);
  const [userSelectionModalVisible, setUserSelectionModalVisible] =
    useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [accountLoading, setAccountLoading] = useState(false);

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

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setFetchingUsers(true);
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (err) {
      setError("Kullanıcılar yüklenirken hata oluştu: " + err.message);
      Alert.alert("Hata", "Kullanıcılar yüklenirken hata oluştu.");
    } finally {
      setFetchingUsers(false);
    }
  };

  const generateUsername = (firstName, lastName) => {
    return `${firstName}${lastName}`
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
  };

  const handleResetCredentials = async () => {
    if (!selectedUser) return;

    Alert.alert(
      "Giriş Bilgilerini Sıfırla",
      "Bu kullanıcının giriş bilgilerini sıfırlamak istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sıfırla",
          style: "destructive",
          onPress: async () => {
            setAccountLoading(true);
            setError("");
            setSuccess("");

            try {
              const response = await axios.post(
                `${API_BASE_URL}/add-credentials-to-user/${selectedUser.id}?force=true`
              );

              const smsStatus = response.data.sms_sent
                ? "SMS gönderildi ✅"
                : "SMS gönderilemedi ❌";
              const successMessage = `Giriş bilgileri sıfırlandı!\n\nKullanıcı adı: ${response.data.generated_credentials.username}\nYeni şifre: ${response.data.generated_credentials.password}\n\n${smsStatus}\n\nLütfen bu bilgileri güvenli bir yerde saklayın!`;

              setSuccess(successMessage);
              Alert.alert("Başarılı", successMessage);

              setAccountInfo({
                has_credentials: true,
                username: response.data.generated_credentials.username,
                last_login: null,
              });

              fetchUsers();
            } catch (err) {
              const errorMessage =
                err.response?.data?.detail ||
                "Giriş bilgileri sıfırlanırken hata oluştu";
              setError(errorMessage);
              Alert.alert("Hata", errorMessage);
            } finally {
              setAccountLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCreateCredentials = async () => {
    if (!selectedUser) return;

    Alert.alert(
      "Giriş Bilgileri Oluştur",
      "Bu kullanıcı için giriş bilgileri oluşturmak istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Oluştur",
          onPress: async () => {
            setAccountLoading(true);
            setError("");
            setSuccess("");

            try {
              const response = await axios.post(
                `${API_BASE_URL}/add-credentials-to-user/${selectedUser.id}?force=false`
              );

              const smsStatus = response.data.sms_sent
                ? "SMS gönderildi ✅"
                : "SMS gönderilemedi ❌";
              const successMessage = `Giriş bilgileri oluşturuldu!\n\nKullanıcı adı: ${response.data.generated_credentials.username}\nŞifre: ${response.data.generated_credentials.password}\n\n${smsStatus}\n\nLütfen bu bilgileri güvenli bir yerde saklayın!`;

              setSuccess(successMessage);
              Alert.alert("Başarılı", successMessage);

              setAccountInfo({
                has_credentials: true,
                username: response.data.generated_credentials.username,
                last_login: null,
              });

              fetchUsers();
            } catch (err) {
              const errorMessage =
                err.response?.data?.detail ||
                "Giriş bilgileri oluşturulurken hata oluştu";
              setError(errorMessage);
              Alert.alert("Hata", errorMessage);
            } finally {
              setAccountLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    if (user) {
      setFormData({
        Ad: user.Ad || "",
        Soyad: user.Soyad || "",
        TC_Kimlik: user.TC_Kimlik || "",
        Adres: user.Adres || "",
        Telefon: user.Telefon || "",
        Mail: user.Mail || "",
        Ev_Sahibi: user.Ev_Sahibi || false,
        Kiraci: user.Kiraci || false,
        Usta: user.Usta || false,
        Yatirimci: user.Yatirimci || false,
        Admin: user.Admin || false,
        Kiraci_Skor: user.Kiraci_Skor,
        Usta_Skor: user.Usta_Skor,
        Alan: user.Alan || "",
        Isletme: user.Isletme || "",
      });
      setError("");
      setSuccess("");

      // User datasından credential durumunu belirle
      const hasCredentials = !!(user.Username && user.Password_Hash);
      setAccountInfo({
        has_credentials: hasCredentials,
        username: user.Username || null,
        last_login: user.Last_Login || null,
      });
    } else {
      setAccountInfo(null);
    }
    setUserSelectionModalVisible(false);
  };

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

  const handleUpdatePerson = async () => {
    if (!selectedUser) {
      setError("Lütfen düzenlenecek kişiyi seçiniz.");
      Alert.alert("Hata", "Lütfen düzenlenecek kişiyi seçiniz.");
      return;
    }

    setError("");
    setSuccess("");

    if (!validateForm()) {
      Alert.alert("Hata", error);
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

      const response = await axios.put(
        `${API_BASE_URL}/user/${selectedUser.id}`,
        dataToSend
      );

      setSuccess("Kişi başarıyla güncellendi!");
      Alert.alert("Başarılı", "Kişi başarıyla güncellendi!");
      fetchUsers();
    } catch (err) {
      let errorMessage = "Kişi güncellenirken bir hata oluştu.";

      if (err.response) {
        const errorData = err.response.data;
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail[0].msg || "Doğrulama hatası oluştu.";
        } else {
          errorMessage = errorData.detail || errorData.message || errorMessage;
        }
      } else if (err.request) {
        errorMessage =
          "Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.";
      } else {
        errorMessage = "Sunucu hatası: " + err.message;
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

  const SwitchRow = ({ label, value, onValueChange }) => (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleUserSelect(item)}
    >
      <Text style={styles.modalItemText}>{`${item.Ad} ${item.Soyad}`}</Text>
      {item.Telefon && (
        <Text style={styles.modalItemSubText}>{item.Telefon}</Text>
      )}
    </TouchableOpacity>
  );

  const renderAlanItem = ({ item }) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => selectAlan(item)}>
      <Text style={styles.modalItemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <DashboardLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kişi Düzenle</Text>
        </View>

        {/* Error/Success Messages */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {success ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{success}</Text>
            <TouchableOpacity onPress={() => setSuccess("")}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* User Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kişi Seç</Text>
          <TouchableOpacity
            style={styles.userSelectionButton}
            onPress={() => setUserSelectionModalVisible(true)}
          >
            <Text style={styles.userSelectionButtonText}>
              {selectedUser
                ? `${selectedUser.Ad} ${selectedUser.Soyad}`
                : "Düzenlenecek Kişiyi Seç"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Edit Form Section */}
        {selectedUser && (
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formHeaderTitle}>
                Kişi Düzenle - {selectedUser.Ad} {selectedUser.Soyad}
              </Text>
            </View>

            {/* Personal Information */}
            <Text style={styles.subsectionTitle}>Kişisel Bilgiler</Text>

            <TextInput
              style={styles.input}
              placeholder="Ad *"
              value={formData.Ad}
              onChangeText={(text) => handleFieldChange("Ad", text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Soyad *"
              value={formData.Soyad}
              onChangeText={(text) => handleFieldChange("Soyad", text)}
            />

            <TextInput
              style={styles.input}
              placeholder="TC Kimlik Numarası"
              value={formData.TC_Kimlik}
              onChangeText={handleTCKimlikChange}
              keyboardType="numeric"
              maxLength={11}
            />

            <TextInput
              style={styles.input}
              placeholder="Telefon"
              value={formData.Telefon}
              onChangeText={(text) => handleFieldChange("Telefon", text)}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="E-posta"
              value={formData.Mail}
              onChangeText={(text) => handleFieldChange("Mail", text)}
              keyboardType="email-address"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Adres"
              value={formData.Adres}
              onChangeText={(text) => handleFieldChange("Adres", text)}
              multiline
              numberOfLines={3}
            />

            {/* Roles */}
            <Text style={styles.subsectionTitle}>Roller</Text>

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

            {/* Professional Information */}
            <Text style={styles.subsectionTitle}>Mesleki Bilgiler</Text>

            <TouchableOpacity
              style={styles.input}
              onPress={() => setAlanModalVisible(true)}
            >
              <Text
                style={
                  formData.Alan ? styles.inputText : styles.placeholderText
                }
              >
                {formData.Alan || "Alan"}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="İşletme"
              value={formData.Isletme}
              onChangeText={(text) => handleFieldChange("Isletme", text)}
            />

            {/* Scoring */}
            <Text style={styles.subsectionTitle}>Puanlama</Text>

            <TextInput
              style={styles.input}
              placeholder="Kiracı Skoru"
              value={
                formData.Kiraci_Skor ? formData.Kiraci_Skor.toString() : ""
              }
              onChangeText={(text) => handleFieldChange("Kiraci_Skor", text)}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Usta Skoru"
              value={formData.Usta_Skor ? formData.Usta_Skor.toString() : ""}
              onChangeText={(text) => handleFieldChange("Usta_Skor", text)}
              keyboardType="numeric"
            />

            {/* Account Management Section */}
            <Text style={styles.subsectionTitle}>Giriş Bilgileri Yönetimi</Text>

            {accountLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#3498db" />
                <Text style={styles.loadingText}>
                  Hesap bilgileri yükleniyor...
                </Text>
              </View>
            ) : accountInfo ? (
              <View style={styles.accountInfoContainer}>
                <View style={styles.accountStatusRow}>
                  <Text style={styles.accountStatusLabel}>Giriş Durumu:</Text>
                  <View
                    style={[
                      styles.accountStatusBadge,
                      {
                        backgroundColor: accountInfo.has_credentials
                          ? "#4caf50"
                          : "#ff9800",
                      },
                    ]}
                  >
                    <Text style={styles.accountStatusText}>
                      {accountInfo.has_credentials
                        ? "Giriş Bilgileri Mevcut"
                        : "Giriş Bilgileri Yok"}
                    </Text>
                  </View>
                </View>
                {accountInfo.has_credentials && (
                  <View style={styles.accountDetails}>
                    <Text style={styles.accountDetailText}>
                      Kullanıcı Adı: {accountInfo.username}
                    </Text>
                    {accountInfo.last_login && (
                      <Text style={styles.accountDetailText}>
                        Son Giriş:{" "}
                        {new Date(accountInfo.last_login).toLocaleString(
                          "tr-TR"
                        )}
                      </Text>
                    )}
                  </View>
                )}
                <View style={styles.accountButtonsContainer}>
                  {accountInfo.has_credentials ? (
                    <TouchableOpacity
                      style={[styles.accountButton, styles.resetButton]}
                      onPress={handleResetCredentials}
                      disabled={accountLoading}
                    >
                      {accountLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.accountButtonText}>
                          Giriş Bilgilerini Sıfırla
                        </Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.accountButton, styles.createButton]}
                      onPress={handleCreateCredentials}
                      disabled={accountLoading}
                    >
                      {accountLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.accountButtonText}>
                          Giriş Bilgileri Oluştur
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.usernamePreview}>
                  * Kullanıcı adı:{" "}
                  {generateUsername(formData.Ad, formData.Soyad)} olarak
                  oluşturulacak
                </Text>
              </View>
            ) : (
              <Text style={styles.errorText}>Hesap bilgileri yüklenemedi.</Text>
            )}

            {/* Update Button */}
            <TouchableOpacity
              style={[styles.updateButton, loading && styles.disabledButton]}
              onPress={handleUpdatePerson}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.updateButtonText}>Kişiyi Düzenle</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* User Selection Modal */}
        <Modal
          visible={userSelectionModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setUserSelectionModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Kişi Seç</Text>
                <TouchableOpacity
                  onPress={() => setUserSelectionModalVisible(false)}
                >
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {fetchingUsers ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3498db" />
                  <Text style={styles.loadingText}>
                    Kullanıcılar yükleniyor...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={users}
                  renderItem={renderUserItem}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.modalList}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </View>
        </Modal>

        {/* Alan Selection Modal */}
        <Modal
          visible={alanModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAlanModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Alan Seç</Text>
                <TouchableOpacity onPress={() => setAlanModalVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={alan}
                renderItem={renderAlanItem}
                keyExtractor={(item) => item}
                style={styles.modalList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  successContainer: {
    backgroundColor: "#E8F5E8",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  successText: {
    color: "#2E7D32",
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  closeButton: {
    fontSize: 18,
    color: "#666",
    padding: 5,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  userSelectionButton: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  userSelectionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  formContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formHeader: {
    backgroundColor: "#ff9800",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  formHeaderTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34495e",
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  inputText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  placeholderText: {
    fontSize: 16,
    color: "#95a5a6",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  switchLabel: {
    fontSize: 16,
    color: "#2c3e50",
  },
  accountInfoContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
  },
  accountStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  accountStatusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginRight: 10,
  },
  accountStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accountStatusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  accountDetails: {
    marginBottom: 15,
  },
  accountDetailText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  accountButtonsContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  accountButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    minWidth: 200,
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: "#ff9800",
  },
  createButton: {
    backgroundColor: "#3498db",
  },
  accountButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  usernamePreview: {
    fontSize: 12,
    color: "#7f8c8d",
    fontStyle: "italic",
    marginTop: 8,
  },
  updateButton: {
    backgroundColor: "#ff9800",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    margin: 20,
    marginTop: 30,
  },
  disabledButton: {
    backgroundColor: "#bdc3c7",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
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
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  modalItemText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  modalItemSubText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 2,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
});

export default KisiDuzenle;
