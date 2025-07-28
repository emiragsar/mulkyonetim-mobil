import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
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

const KontratYonetimi = () => {
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);

  // Form verileri
  const [tenant, setTenant] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [yearlyRent, setYearlyRent] = useState("");
  const [paymentDay, setPaymentDay] = useState("");
  const [startDay, setStartDay] = useState("4");
  const [startMonth, setStartMonth] = useState("12");
  const [startYear, setStartYear] = useState("2023");
  const [endDay, setEndDay] = useState("17");
  const [endMonth, setEndMonth] = useState("6");
  const [endYear, setEndYear] = useState("2024");
  const [bank, setBank] = useState("Vasquez, Jacobson and Cox");
  const [iban, setIban] = useState("GB95UCJQ29541298165409");
  const [deposit, setDeposit] = useState("9942.16");
  const [monthlyCompanyFee, setMonthlyCompanyFee] = useState("351.66");
  const [yearlyCompanyFee, setYearlyCompanyFee] = useState("3672.48");
  const [companyCommission, setCompanyCommission] = useState("524.22");
  const [totalDelayedPayment, setTotalDelayedPayment] = useState("11333.7");
  const [totalPayment, setTotalPayment] = useState("107203");
  const [lastPayment, setLastPayment] = useState("1977-04-28");
  const [totalExtraPayment, setTotalExtraPayment] = useState("");
  const [lastPaymentMonth, setLastPaymentMonth] = useState("6");

  // Toggle states
  const [rentGuarantee, setRentGuarantee] = useState(false);
  const [companyCommissionPayment, setCompanyCommissionPayment] =
    useState(true);
  const [contractActive, setContractActive] = useState(true);

  // Veri listeleri
  const [owners, setOwners] = useState([]);
  const [availableProperties, setAvailableProperties] = useState([]);

  useEffect(() => {
    const allOwners = [
      ...getUsersByType(USER_TYPES.OWNER),
      ...getUsersByType(USER_TYPES.ADMIN),
    ];
    setOwners(allOwners);
  }, []);

  const handleOwnerSelect = (owner) => {
    setSelectedOwner(owner);
    setSelectedProperty(null);
    setShowOwnerModal(false);
    setShowContractForm(false);
  };

  const handlePropertySelect = () => {
    if (selectedOwner) {
      // Seçili ev sahibinin mülklerini getir
      const ownerProperties = getPropertiesByOwner(selectedOwner.id);
      setAvailableProperties(ownerProperties);
    } else {
      // Tüm mülkleri getir
      setAvailableProperties(properties);
    }
    setShowPropertyModal(true);
  };

  const handlePropertyChoose = (property) => {
    setSelectedProperty(property);
    setShowPropertyModal(false);
    setShowContractForm(true);

    // Seçilen mülkün fiyatını otomatik doldur
    setMonthlyRent(property.price);
    setYearlyRent((parseFloat(property.price) * 12).toString());
  };

  const handleContractUpdate = () => {
    Alert.alert("Kontrat Güncellendi", "Kontrat başarıyla güncellendi!", [
      { text: "Tamam", onPress: () => console.log("Kontrat güncellendi") },
    ]);
  };

  const OwnerModal = () => (
    <Modal visible={showOwnerModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ev Sahibi Seç</Text>
            <TouchableOpacity onPress={() => setShowOwnerModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={owners}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => handleOwnerSelect(item)}
              >
                <Text style={styles.modalItemText}>{item.fullName}</Text>
                <Text style={styles.modalItemSubtext}>{item.address}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const PropertyModal = () => (
    <Modal visible={showPropertyModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Daire Seç</Text>
            <TouchableOpacity onPress={() => setShowPropertyModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={availableProperties}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const owner = getUserById(item.ownerId);
              return (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handlePropertyChoose(item)}
                >
                  <Text style={styles.modalItemText}>{item.address}</Text>
                  <Text style={styles.modalItemSubtext}>
                    Sahibi: {owner?.fullName} - {item.price} TL
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.blueHeader}>
          <Text style={styles.headerTitle}>Kontratları Yönet</Text>
        </View>

        {/* Seçim Alanları */}
        <View style={styles.selectionContainer}>
          <TouchableOpacity
            style={styles.selectionInput}
            onPress={() => setShowOwnerModal(true)}
          >
            <Text
              style={[
                styles.selectionText,
                !selectedOwner && styles.placeholderText,
              ]}
            >
              {selectedOwner
                ? selectedOwner.fullName
                : "Ev Sahibi Seç (Opsiyonel)"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectionInput, styles.propertyInput]}
            onPress={handlePropertySelect}
          >
            <Text
              style={[
                styles.selectionText,
                !selectedProperty && styles.placeholderText,
              ]}
            >
              {selectedProperty ? selectedProperty.address : "Daire Seç"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#3498db" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Kontrat Formu */}
      {showContractForm && (
        <View>
          {/* Kontrat Düzenle */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kontrat Düzenle</Text>
            </View>
          </View>

          {/* Temel Bilgiler */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Temel Bilgiler</Text>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Kiracı</Text>
                <TextInput
                  style={styles.textInput}
                  value={tenant}
                  onChangeText={setTenant}
                  placeholder="Kiracı adı"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Aylık Kira Bedeli</Text>
                <TextInput
                  style={styles.textInput}
                  value={monthlyRent}
                  onChangeText={setMonthlyRent}
                  placeholder="7610,5"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Yıllık Kira Bedeli</Text>
                <TextInput
                  style={styles.textInput}
                  value={yearlyRent}
                  onChangeText={setYearlyRent}
                  placeholder="142432"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Ödeme Günü</Text>
                <TextInput
                  style={styles.textInput}
                  value={paymentDay}
                  onChangeText={setPaymentDay}
                  placeholder="28"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Güncelle Butonu */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleContractUpdate}
            >
              <Text style={styles.updateButtonText}>KONTRATI GÜNCELLE</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025, <Text style={styles.footerLink}>rbit Teknoloji</Text>{" "}
          tarafından akıllı mülk yönetimi için oluşturuldu
        </Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLink}>rbit Teknoloji</Text>
          <Text style={styles.footerLink}>Hakkımızda</Text>
          <Text style={styles.footerLink}>Blog</Text>
          <Text style={styles.footerLink}>Gizlilik</Text>
        </View>
      </View>

      {/* Modals are rendered outside the ScrollView but within the main component's return */}
      <OwnerModal />
      <PropertyModal />
    </ScrollView>
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
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  blueHeader: {
    backgroundColor: "#3498db",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  selectionContainer: {
    padding: 20,
    flexDirection: "row",
    gap: 15,
  },
  selectionInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  propertyInput: {
    borderColor: "#3498db",
    borderWidth: 2,
  },
  selectionText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    backgroundColor: "#f39c12",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  formSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 15,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  updateButton: {
    backgroundColor: "#3498db",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  modalItemSubtext: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  footerLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  footerLink: {
    fontSize: 12,
    color: "#3498db",
    marginHorizontal: 8,
    marginVertical: 2,
  },
});

export default KontratYonetimi;
