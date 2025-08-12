import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SelectionModal = ({
  // Trigger props
  placeholder = "Seçin",
  value = null,
  disabled = false,
  loading = false,
  required = false,
  style = {},

  // Modal props
  title,
  data = [],
  onSelect,
  renderItem = null,
  keyExtractor = null,
  emptyMessage = "Veri bulunamadı",

  // Display props
  displayKey = null, // Seçilen değerin hangi property'sini göstereceğiz
  displayFormat = null, // Custom format fonksiyonu
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Seçilen değerin display text'ini hesapla
  const getDisplayText = () => {
    if (!value) return placeholder;

    if (displayFormat && typeof displayFormat === "function") {
      return displayFormat(value);
    }

    if (typeof value === "string") return value;

    if (displayKey) return value[displayKey];

    // Varsayılan format
    if (value.Ad && value.Soyad) return `${value.Ad} ${value.Soyad}`;
    if (value.name) return value.name;
    if (value.Ad) return value.Ad;

    return value.toString();
  };

  // Modal açma fonksiyonu
  const openModal = () => {
    if (disabled || loading) return;
    setModalVisible(true);
  };

  // Modal kapama fonksiyonu
  const closeModal = () => {
    setModalVisible(false);
  };

  // Seçim yapıldığında
  const handleSelect = (item) => {
    onSelect(item);
    closeModal();
  };

  // Varsayılan render item fonksiyonu
  const defaultRenderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.modalItemText}>
        {typeof item === "string"
          ? item
          : item.name || item.Ad || `${item.Ad} ${item.Soyad}` || "Bilinmeyen"}
      </Text>
      {item.Email && <Text style={styles.modalSubText}>{item.Email}</Text>}
    </TouchableOpacity>
  );

  // Varsayılan key extractor
  const defaultKeyExtractor = (item, index) => {
    if (typeof item === "string") return index.toString();
    return item.id?.toString() || item.Id?.toString() || index.toString();
  };

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        style={[
          styles.pickerButton,
          disabled && styles.disabledButton,
          required && !value && styles.requiredInput,
          style,
        ]}
        onPress={openModal}
        disabled={disabled || loading}
      >
        <Text
          style={[styles.pickerButtonText, !value && styles.placeholderText]}
        >
          {getDisplayText()}
        </Text>
        {loading ? (
          <ActivityIndicator size={16} color="#666" />
        ) : (
          <Ionicons name="chevron-down" size={16} color="#666" />
        )}
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            {data.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{emptyMessage}</Text>
              </View>
            ) : (
              <FlatList
                data={data}
                keyExtractor={keyExtractor || defaultKeyExtractor}
                renderItem={renderItem || defaultRenderItem}
                showsVerticalScrollIndicator={false}
                style={styles.listContainer}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Trigger Button Styles
  pickerButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerButtonText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  disabledButton: {
    backgroundColor: "#f5f5f5",
    opacity: 0.6,
  },
  requiredInput: {
    borderColor: "#F44336",
    borderWidth: 2,
  },

  // Modal Styles
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
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 20,
    color: "#666",
    fontWeight: "bold",
  },
  listContainer: {
    maxHeight: 400,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  modalSubText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
  },
});

export default SelectionModal;
