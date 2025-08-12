import ErrorView from "@/app/components/shared/ErrorView.jsx";
import ImageGalleryModal from "@/app/components/shared/ImageGalleryModal.jsx";
import LoadingView from "@/app/components/shared/LoadingView.jsx";
import PageLayout from "@/app/components/shared/PageLayout.jsx";
import commonStyles from "@/app/components/shared/styles.js";
import API_BASE_URL from "@/config/api";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { formatDate, useArizaTableData } from "./data.js";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Custom Select Component for Modal
const CustomSelect = ({
  label,
  selectedValue,
  onValueChange,
  items,
  placeholder = "Seçiniz...",
  disabled = false,
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
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ padding: 4 }}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.selectList}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={styles.selectItem}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.selectItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Solution Dialog Component
const SolutionDialog = ({ open, onClose, ariza, ustas, onSuccess }) => {
  const [ilgilenenUsta, setIlgilenenUsta] = useState(null);
  const [selectedUsta, setSelectedUsta] = useState(null);
  const [solutionDate, setSolutionDate] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [sorumlu, setSorumlu] = useState("Kiracı");
  const [cozuldu, setCozuldu] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (ariza) {
      const now = new Date();
      setSolutionDate(
        ariza.cozum_tarihi &&
          ariza.cozum_tarihi !== "-" &&
          !isNaN(new Date(ariza.cozum_tarihi).getTime())
          ? new Date(ariza.cozum_tarihi).toISOString().slice(0, 16)
          : now.toISOString().slice(0, 16)
      );

      setIlgilenenUsta(
        ariza.ilgilenen_usta && ariza.ilgilenen_usta !== "-"
          ? ustas.find((u) => u["Ad-Soyad"] === ariza.ilgilenen_usta)
          : null
      );

      setSelectedUsta(
        ariza.cozen_usta && ariza.cozen_usta !== "-"
          ? ustas.find((u) => u["Ad-Soyad"] === ariza.cozen_usta)
          : null
      );

      setFiyat(
        ariza.fiyat && ariza.fiyat !== "-" ? ariza.fiyat.replace(" ₺", "") : ""
      );

      setSorumlu(ariza.sorumlu || "Kiracı");

      // Always default to "Çözüldü" (true)
      setCozuldu(ariza.basariyla_cozuldu !== false);

      setErrors({});
    }
  }, [ariza, ustas]);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedUsta) {
      newErrors.usta = "Lütfen çözen usta seçin";
    }

    if (!ilgilenenUsta) {
      newErrors.ilgilenenUsta = "Lütfen ilgilenen usta seçin";
    }

    if (!solutionDate) {
      newErrors.date = "Lütfen çözüm tarihini seçin";
    }

    if (!fiyat || parseFloat(fiyat) <= 0) {
      newErrors.fiyat = "Lütfen geçerli bir fiyat girin";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.put(`${API_BASE_URL}/ariza/${ariza.id}`, {
        Basariyla_Cozuldu: cozuldu,
        Cozen_Usta_ID: selectedUsta.id,
        Ilgilenen_Usta: ilgilenenUsta.id,
        Cozum_Tarihi: solutionDate,
        Fiyat: parseFloat(fiyat),
        Sorumlu: sorumlu,
      });

      // Pass updated values to onSuccess
      onSuccess({
        ...ariza,
        cozen_usta: selectedUsta["Ad-Soyad"],
        ilgilenen_usta: ilgilenenUsta["Ad-Soyad"],
        cozum_tarihi: formatDate(solutionDate),
        fiyat: `${fiyat} ₺`,
        sorumlu: sorumlu,
        durum: cozuldu ? "Çözüldü" : "Bekliyor",
        basariyla_cozuldu: cozuldu,
      });

      onClose();
    } catch (error) {
      console.error("Error updating ariza:", error);
      setErrors({ submit: "Arıza güncellenirken bir hata oluştu!" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ustaOptions = ustas.map((usta) => ({
    value: usta.id,
    label: usta["Ad-Soyad"],
  }));

  const sorumluOptions = [
    { value: "Kiracı", label: "Kiracı" },
    { value: "Ev Sahibi", label: "Ev Sahibi" },
    { value: "Müteahhit", label: "Müteahhit" },
  ];

  if (!open) return null;

  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Arızayı Güncelle</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            {errors.submit && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                <Text style={styles.errorText}>{errors.submit}</Text>
              </View>
            )}

            <CustomSelect
              label="İlgilenen Usta"
              selectedValue={ilgilenenUsta?.id}
              onValueChange={(value) => {
                const usta = ustas.find((u) => u.id === value);
                setIlgilenenUsta(usta);
                if (usta && errors.ilgilenenUsta) {
                  setErrors((prev) => ({ ...prev, ilgilenenUsta: null }));
                }
              }}
              items={ustaOptions}
              placeholder="İlgilenen usta seçin..."
              disabled={true}
            />
            {errors.ilgilenenUsta && (
              <Text style={styles.fieldError}>{errors.ilgilenenUsta}</Text>
            )}

            <CustomSelect
              label="Çözen Usta"
              selectedValue={selectedUsta?.id}
              onValueChange={(value) => {
                const usta = ustas.find((u) => u.id === value);
                setSelectedUsta(usta);
                if (usta && errors.usta) {
                  setErrors((prev) => ({ ...prev, usta: null }));
                }
              }}
              items={ustaOptions}
              placeholder="Çözen usta seçin..."
            />
            {errors.usta && (
              <Text style={styles.fieldError}>{errors.usta}</Text>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Fiyat (₺)</Text>
              <TextInput
                style={[styles.textInput, errors.fiyat && styles.errorInput]}
                value={fiyat}
                onChangeText={(text) => {
                  setFiyat(text);
                  if (text && errors.fiyat) {
                    setErrors((prev) => ({ ...prev, fiyat: null }));
                  }
                }}
                placeholder="Fiyat girin..."
                keyboardType="numeric"
              />
              {errors.fiyat && (
                <Text style={styles.fieldError}>{errors.fiyat}</Text>
              )}
            </View>

            <CustomSelect
              label="Sorumlu"
              selectedValue={sorumlu}
              onValueChange={setSorumlu}
              items={sorumluOptions}
              placeholder="Sorumlu seçin..."
            />

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Çözüm Tarihi</Text>
              <TextInput
                style={[styles.textInput, errors.date && styles.errorInput]}
                value={solutionDate}
                onChangeText={(text) => {
                  setSolutionDate(text);
                  if (text && errors.date) {
                    setErrors((prev) => ({ ...prev, date: null }));
                  }
                }}
                placeholder="YYYY-MM-DD HH:MM"
              />
              {errors.date && (
                <Text style={styles.fieldError}>{errors.date}</Text>
              )}
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Çözüldü</Text>
              <TouchableOpacity
                style={[styles.switch, cozuldu && styles.switchActive]}
                onPress={() => setCozuldu(!cozuldu)}
              >
                <View
                  style={[
                    styles.switchThumb,
                    cozuldu && styles.switchThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                Object.keys(errors).length > 0 && styles.errorButton,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? "Güncelleniyor..." : "Güncelle"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ArizaTable = () => {
  const {
    rows,
    loading,
    error,
    imageGalleryItems,
    showGallery,
    currentImageIndex,
    showSolutionModal,
    currentAriza,
    ustas,
    handleViewPhotos,
    handleSolveAriza,
    handleCloseSolutionModal,
    handleSuccess,
    setShowGallery,
    setCurrentImageIndex,
    refetch,
  } = useArizaTableData();

  // DataTable columns
  const columns = [
    {
      Header: "Oluşturan",
      accessor: "ariza_olusturan",
      flex: 2,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "Adres",
      accessor: "daire_adres",
      flex: 3,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.addressCell} numberOfLines={3}>
          {value}
        </Text>
      ),
    },
    {
      Header: "Tarih",
      accessor: "ariza_tarihi",
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "Açıklama",
      accessor: "ariza_aciklama",
      flex: 2.5,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={3}>
          {value}
        </Text>
      ),
    },
    {
      Header: "Fotoğraflar",
      accessor: "fotograflar",
      flex: 1.2,
      align: "center",
      Cell: ({ value }) => (
        <TouchableOpacity
          style={[commonStyles.actionButton, commonStyles.infoButton]}
          onPress={() => handleViewPhotos(value)}
        >
          <Text style={commonStyles.actionButtonText}>Görüntüle</Text>
        </TouchableOpacity>
      ),
    },
    {
      Header: "İlgilenen Usta",
      accessor: "ilgilenen_usta",
      flex: 2,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "Sorumlu",
      accessor: "sorumlu",
      flex: 1.2,
      align: "center",
      Cell: ({ value }) => (
        <Text
          style={[
            commonStyles.tableCell,
            value === "Kiracı"
              ? commonStyles.infoText
              : value === "Ev Sahibi"
              ? commonStyles.warningText
              : commonStyles.secondaryText,
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
      ),
    },
    {
      Header: "Fiyat",
      accessor: "fiyat",
      flex: 1.2,
      align: "right",
      Cell: ({ value }) => (
        <Text
          style={[
            commonStyles.tableCell,
            value !== "-"
              ? commonStyles.successText
              : commonStyles.secondaryText,
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
      ),
    },
    {
      Header: "Durum",
      accessor: "durumText",
      flex: 1.2,
      align: "center",
      Cell: ({ value, row }) => (
        <Text
          style={[
            commonStyles.tableCell,
            row.original.durum
              ? commonStyles.successText
              : commonStyles.errorText,
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
      ),
    },
    {
      Header: "Çözen Usta",
      accessor: "cozen_usta",
      flex: 2,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "Çözüm Tarihi",
      accessor: "cozum_tarihi",
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "İşlem",
      accessor: "coz",
      flex: 1.2,
      align: "center",
      Cell: ({ value, row }) => (
        <TouchableOpacity
          style={[commonStyles.actionButton, commonStyles.infoButton]}
          onPress={() => handleSolveAriza(value)}
        >
          <Text style={commonStyles.actionButtonText}>Güncelle</Text>
        </TouchableOpacity>
      ),
    },
  ];

  // DataTable için veri yapısını hazırlıyoruz
  const tableData = {
    columns,
    rows,
  };

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={refetch} />;
  }

  return (
    <PageLayout title="Arıza Listesi" tableData={tableData} onRefresh={refetch}>
      {/* Image Gallery Modal */}
      <ImageGalleryModal
        visible={showGallery}
        images={imageGalleryItems}
        currentIndex={currentImageIndex}
        setCurrentIndex={setCurrentImageIndex}
        onClose={() => setShowGallery(false)}
      />

      {/* Solution Dialog */}
      <SolutionDialog
        open={showSolutionModal}
        onClose={handleCloseSolutionModal}
        ariza={currentAriza}
        ustas={ustas}
        onSuccess={handleSuccess}
      />
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  // Modal overlay styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 500,
    maxHeight: screenHeight * 0.85,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },

  // Custom Select styles
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabledSelect: {
    backgroundColor: "#f8f9fa",
    borderColor: "#dee2e6",
  },
  selectText: {
    fontSize: 16,
    color: "#2c3e50",
    flex: 1,
  },
  placeholderText: {
    color: "#95a5a6",
  },
  disabledText: {
    color: "#bdc3c7",
  },
  selectList: {
    maxHeight: 250,
  },
  selectItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  selectItemText: {
    fontSize: 16,
    color: "#2c3e50",
  },

  // Form styles
  formContainer: {
    padding: 20,
    maxHeight: 450,
  },
  textInput: {
    borderWidth: 2,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#2c3e50",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  errorInput: {
    borderColor: "#e74c3c",
    backgroundColor: "#fdf2f2",
  },
  fieldError: {
    color: "#e74c3c",
    fontSize: 14,
    marginTop: 6,
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: "#fdf2f2",
    borderColor: "#e74c3c",
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },

  // Switch styles
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  switch: {
    width: 60,
    height: 30,
    backgroundColor: "#ecf0f1",
    borderRadius: 15,
    padding: 3,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  switchActive: {
    backgroundColor: "#27ae60",
  },
  switchThumb: {
    width: 24,
    height: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  switchThumbActive: {
    transform: [{ translateX: 30 }],
  },

  // Button styles
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#f8f9fa",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
  },
  submitButton: {
    backgroundColor: "#27ae60",
  },
  errorButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: "#bdc3c7",
    elevation: 1,
  },
});

export default ArizaTable;
