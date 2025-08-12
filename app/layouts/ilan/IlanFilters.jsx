import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

// Custom Select Component
const CustomSelect = ({
  label,
  selectedValue,
  onValueChange,
  items,
  placeholder = "Seçiniz...",
  disabled = false,
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
  keyboardType = "default",
  prefix = "",
  suffix = "",
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      {prefix ? <Text style={styles.inputPrefix}>{prefix}</Text> : null}
      <TextInput
        style={[
          styles.textInput,
          (prefix || suffix) && styles.textInputWithAdornment,
        ]}
        value={String(value || "")}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
      />
      {suffix ? <Text style={styles.inputSuffix}>{suffix}</Text> : null}
    </View>
  </View>
);

// Filter Chip Component
const FilterChip = ({ label, onDelete }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
    <TouchableOpacity onPress={onDelete} style={styles.chipDeleteButton}>
      <Ionicons name="close" size={16} color="#3498db" />
    </TouchableOpacity>
  </View>
);

const IlanFilters = ({ visible, onClose, filters, onFiltersChange }) => {
  const [veri, setVeri] = useState([]);
  const [mahalleler, setMahalleler] = useState([]);
  const ilapi = "https://turkiyeapi.dev/api/v1/provinces";

  const odaSayilari = [
    "1+0",
    "1+1",
    "2+1",
    "3+1",
    "3+2",
    "4+1",
    "4+2",
    "5+1",
    "5+2",
    "6+1",
    "6+2",
  ];

  const fetchMahalleler = async (il, ilce) => {
    if (!il || !ilce) return;
    try {
      const response = await axios.get(
        `https://turkiyeapi.dev/api/v1/neighborhoods?province=${il}&district=${ilce}`
      );
      if (response.data.status === "OK") {
        const mahalleListesi = response.data.data.map(
          (mahalle) => mahalle.name
        );
        setMahalleler(mahalleListesi);
      }
    } catch (error) {
      console.error("Mahalle API hatası:", error);
      setMahalleler([]);
    }
  };

  const fetchIl = async () => {
    try {
      const response = await axios.get(ilapi);
      if (response.data.status === "OK") {
        const ilveilce = response.data.data.map((sehir) => ({
          il: sehir.name,
          ilceler: sehir.districts.map((ilce) => ilce.name),
        }));
        setVeri(ilveilce);
      }
    } catch (error) {
      console.error("API hatası:", error);
    }
  };

  useEffect(() => {
    fetchIl();
  }, []);

  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...filters,
      [field]: value,
      // İl değiştiğinde ilçe sıfırla
      ...(field === "Ilan_Il" && { Ilan_Ilce: "" }),
    };

    onFiltersChange(newFilters);

    // İlçe değiştiğinde mahalleleri getir
    if (field === "Ilan_Ilce" && value && filters.Ilan_Il) {
      fetchMahalleler(filters.Ilan_Il, value);
    }

    // İl değiştiğinde mahalleleri temizle
    if (field === "Ilan_Il") {
      setMahalleler([]);
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      durum: "all",
      Ilan_Turu: "all",
      Ilan_Il: "",
      Ilan_Ilce: "",
      fiyat_min: "",
      fiyat_max: "",
      Esya: "all",
      Oda_Sayisi: "",
      m2_min: "",
      m2_max: "",
      arama: "",
      has_photos: "all",
    });
    setMahalleler([]);
  };

  const formatPrice = (price) => {
    if (!price) return "";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const unformatPrice = (formattedPrice) => {
    if (!formattedPrice) return "";
    return formattedPrice.replace(/\./g, "");
  };

  const handlePriceChange = (field, value) => {
    const unformattedValue = unformatPrice(value);
    if (/^\d*$/.test(unformattedValue)) {
      handleFilterChange(field, unformattedValue);
    }
  };

  // Seçenekler
  const durumOptions = [
    { label: "Tümü", value: "all" },
    { label: "Aktif İlanlar", value: "aktif" },
    { label: "Pasif İlanlar", value: "pasif" },
  ];

  const ilanTuruOptions = [
    { label: "Tümü", value: "all" },
    { label: "Kiralık", value: "kiralik" },
    { label: "Satılık", value: "satilik" },
    { label: "Kısa Dönemli Kiralık", value: "kisadonemli_kiralik" },
  ];

  const esyaOptions = [
    { label: "Tümü", value: "all" },
    { label: "Eşyalı", value: "true" },
    { label: "Eşyasız", value: "false" },
  ];

  const ilOptions = [
    { label: "Tümü", value: "" },
    ...veri.map((item) => ({ label: item.il, value: item.il })),
  ];

  const ilceOptions = filters.Ilan_Il
    ? [
        { label: "Tümü", value: "" },
        ...(veri
          .find((item) => item.il === filters.Ilan_Il)
          ?.ilceler?.map((ilce) => ({
            label: ilce,
            value: ilce,
          })) || []),
      ]
    : [{ label: "Tümü", value: "" }];

  const odaOptions = [
    { label: "Tümü", value: "" },
    ...odaSayilari.map((oda) => ({ label: oda, value: oda })),
  ];

  // Aktif filtreler
  const getActiveFilters = () => {
    const activeFilters = [];

    if (filters.durum !== "all") {
      activeFilters.push({
        label: `Durum: ${filters.durum === "aktif" ? "Aktif" : "Pasif"}`,
        onDelete: () => handleFilterChange("durum", "all"),
      });
    }

    if (filters.Ilan_Turu !== "all") {
      const turLabel =
        ilanTuruOptions.find((opt) => opt.value === filters.Ilan_Turu)?.label ||
        filters.Ilan_Turu;
      activeFilters.push({
        label: `Tür: ${turLabel}`,
        onDelete: () => handleFilterChange("Ilan_Turu", "all"),
      });
    }

    if (filters.Ilan_Il) {
      activeFilters.push({
        label: `İl: ${filters.Ilan_Il}`,
        onDelete: () => handleFilterChange("Ilan_Il", ""),
      });
    }

    if (filters.Ilan_Ilce) {
      activeFilters.push({
        label: `İlçe: ${filters.Ilan_Ilce}`,
        onDelete: () => handleFilterChange("Ilan_Ilce", ""),
      });
    }

    if (filters.Oda_Sayisi) {
      activeFilters.push({
        label: `Oda: ${filters.Oda_Sayisi}`,
        onDelete: () => handleFilterChange("Oda_Sayisi", ""),
      });
    }

    if (filters.Esya !== "all") {
      activeFilters.push({
        label: `${filters.Esya === "true" ? "Eşyalı" : "Eşyasız"}`,
        onDelete: () => handleFilterChange("Esya", "all"),
      });
    }

    if (filters.fiyat_min || filters.fiyat_max) {
      activeFilters.push({
        label: `Fiyat: ${formatPrice(filters.fiyat_min) || "0"} - ${
          formatPrice(filters.fiyat_max) || "∞"
        } ₺`,
        onDelete: () => {
          const newFilters = { ...filters };
          newFilters.fiyat_min = "";
          newFilters.fiyat_max = "";
          onFiltersChange(newFilters);
        },
      });
    }

    if (filters.m2_min || filters.m2_max) {
      activeFilters.push({
        label: `M²: ${filters.m2_min || "0"} - ${filters.m2_max || "∞"} m²`,
        onDelete: () => {
          const newFilters = { ...filters };
          newFilters.m2_min = "";
          newFilters.m2_max = "";
          onFiltersChange(newFilters);
        },
      });
    }

    if (filters.arama) {
      activeFilters.push({
        label: `Arama: "${filters.arama}"`,
        onDelete: () => handleFilterChange("arama", ""),
      });
    }

    return activeFilters;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Gelişmiş Filtreler</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearAllFilters}
              >
                <Ionicons name="trash-outline" size={16} color="#3498db" />
                <Text style={styles.clearButtonText}>Temizle</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Arama */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Arama</Text>
              <View style={styles.searchInputContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#666"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  value={filters.arama}
                  onChangeText={(value) => handleFilterChange("arama", value)}
                  placeholder="İlan başlığı, açıklama veya özellikler..."
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Row 1: İlan Durumu ve İlan Türü */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <CustomSelect
                  label="İlan Durumu"
                  selectedValue={filters.durum}
                  onValueChange={(value) => handleFilterChange("durum", value)}
                  items={durumOptions}
                />
              </View>
              <View style={styles.halfWidth}>
                <CustomSelect
                  label="İlan Türü"
                  selectedValue={filters.Ilan_Turu}
                  onValueChange={(value) =>
                    handleFilterChange("Ilan_Turu", value)
                  }
                  items={ilanTuruOptions}
                />
              </View>
            </View>

            {/* Row 2: Eşyalı */}
            <CustomSelect
              label="Eşyalı"
              selectedValue={filters.Esya}
              onValueChange={(value) => handleFilterChange("Esya", value)}
              items={esyaOptions}
            />

            {/* Row 3: İl, İlçe, Oda Sayısı */}
            <View style={styles.threeColumnRow}>
              <View style={styles.thirdWidth}>
                <CustomSelect
                  label="İl"
                  selectedValue={filters.Ilan_Il}
                  onValueChange={(value) =>
                    handleFilterChange("Ilan_Il", value)
                  }
                  items={ilOptions}
                />
              </View>
              <View style={styles.thirdWidth}>
                <CustomSelect
                  label="İlçe"
                  selectedValue={filters.Ilan_Ilce}
                  onValueChange={(value) =>
                    handleFilterChange("Ilan_Ilce", value)
                  }
                  items={ilceOptions}
                  disabled={!filters.Ilan_Il}
                />
              </View>
              <View style={styles.thirdWidth}>
                <CustomSelect
                  label="Oda Sayısı"
                  selectedValue={filters.Oda_Sayisi}
                  onValueChange={(value) =>
                    handleFilterChange("Oda_Sayisi", value)
                  }
                  items={odaOptions}
                />
              </View>
            </View>

            {/* Fiyat Aralığı */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fiyat Aralığı (₺)</Text>
            </View>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="Min Fiyat"
                  value={formatPrice(filters.fiyat_min)}
                  onChangeText={(value) =>
                    handlePriceChange("fiyat_min", value)
                  }
                  keyboardType="numeric"
                  prefix="₺"
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Max Fiyat"
                  value={formatPrice(filters.fiyat_max)}
                  onChangeText={(value) =>
                    handlePriceChange("fiyat_max", value)
                  }
                  keyboardType="numeric"
                  prefix="₺"
                />
              </View>
            </View>

            {/* M² Aralığı */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>M² Aralığı</Text>
            </View>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="Min M²"
                  value={filters.m2_min}
                  onChangeText={(value) => handleFilterChange("m2_min", value)}
                  keyboardType="numeric"
                  suffix="m²"
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Max M²"
                  value={filters.m2_max}
                  onChangeText={(value) => handleFilterChange("m2_max", value)}
                  keyboardType="numeric"
                  suffix="m²"
                />
              </View>
            </View>

            {/* Aktif Filtreler */}
            {getActiveFilters().length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Aktif Filtreler</Text>
                </View>
                <View style={styles.chipsContainer}>
                  {getActiveFilters().map((filter, index) => (
                    <FilterChip
                      key={index}
                      label={filter.label}
                      onDelete={filter.onDelete}
                    />
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Kapat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyButtonText}>Filtreleri Uygula</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "95%",
    maxHeight: "90%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#3498db",
    borderRadius: 6,
    marginRight: 10,
  },
  clearButtonText: {
    color: "#3498db",
    fontSize: 12,
    marginLeft: 4,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
    maxHeight: 500,
  },
  sectionHeader: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
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
  threeColumnRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  thirdWidth: {
    flex: 1,
    marginHorizontal: 3,
  },
  // Input Styles
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    minHeight: 45,
  },
  inputPrefix: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#666",
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  inputSuffix: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#666",
    borderLeftWidth: 1,
    borderLeftColor: "#eee",
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
    minHeight: 45,
  },
  textInputWithAdornment: {
    paddingHorizontal: 8,
  },
  // Search Input Styles
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    minHeight: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    paddingVertical: 12,
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
  // Modal Styles for Select
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
  // Chip Styles
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 2,
    borderWidth: 1,
    borderColor: "#3498db",
  },
  chipText: {
    fontSize: 12,
    color: "#3498db",
    fontWeight: "500",
  },
  chipDeleteButton: {
    marginLeft: 6,
    padding: 2,
  },
  // Action Buttons
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#3498db",
  },
  cancelButtonText: {
    color: "#3498db",
    fontSize: 14,
    fontWeight: "600",
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#3498db",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default IlanFilters;
