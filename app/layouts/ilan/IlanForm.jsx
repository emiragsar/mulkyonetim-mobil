import API_BASE_URL from "@/config/api";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import formFields from "./formfields";
const { width: screenWidth } = Dimensions.get("window");

// Custom Select Component
const CustomSelect = ({
  label,
  selectedValue,
  onValueChange,
  items,
  placeholder = "Seçiniz...",
  disabled = false,
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
  required = false,
  multiline = false,
}) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.inputLabel, required && styles.requiredLabel]}>
      {label} {required && "*"}
    </Text>
    <View style={styles.inputWrapper}>
      {prefix ? <Text style={styles.inputPrefix}>{prefix}</Text> : null}
      <TextInput
        style={[
          styles.textInput,
          (prefix || suffix) && styles.textInputWithAdornment,
          multiline && styles.multilineInput,
        ]}
        value={String(value || "")}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
      {suffix ? <Text style={styles.inputSuffix}>{suffix}</Text> : null}
    </View>
  </View>
);

// Switch Field Component
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

// Photo Item Component
const PhotoItem = ({ photo, onDelete, isNew = false }) => (
  <View style={styles.photoItem}>
    <Image
      source={{ uri: isNew ? photo.uri : photo.Url }}
      style={styles.photoImage}
      resizeMode="cover"
    />
    <TouchableOpacity style={styles.photoDeleteButton} onPress={onDelete}>
      <Ionicons name="close-circle" size={24} color="#e74c3c" />
    </TouchableOpacity>
    <View style={styles.photoCaption}>
      <Text style={styles.photoCaptionText} numberOfLines={1}>
        {isNew ? photo.name : photo.Fotograf_Aciklama}
      </Text>
    </View>
  </View>
);

// Toast Component
const Toast = ({ visible, message, type, onHide }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  const getToastColor = () => {
    switch (type) {
      case "success":
        return "#27ae60";
      case "error":
        return "#e74c3c";
      case "warning":
        return "#f39c12";
      default:
        return "#3498db";
    }
  };

  return (
    <View style={[styles.toast, { backgroundColor: getToastColor() }]}>
      <Text style={styles.toastText}>{message}</Text>
      <TouchableOpacity onPress={onHide} style={styles.toastCloseButton}>
        <Ionicons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// Chip Component
const Chip = ({ label, color = "info" }) => {
  const getChipColor = () => {
    switch (color) {
      case "info":
        return "#3498db";
      case "success":
        return "#27ae60";
      case "warning":
        return "#f39c12";
      default:
        return "#3498db";
    }
  };

  return (
    <View style={[styles.chip, { backgroundColor: getChipColor() }]}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
};

const IlanForm = ({ initialData, onSave, onCancel, ilanFotograflar = [] }) => {
  const [daireler, setDaireler] = useState([]);
  const [selectedDaire, setSelectedDaire] = useState(null);
  const [loading, setLoading] = useState(false);
  const [daireLoading, setDaireLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState(ilanFotograflar);
  const [photoUploadLoading, setPhotoUploadLoading] = useState(false);

  // Toast için state
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  // Toast gösterme fonksiyonu
  const showToast = useCallback((type, message) => {
    setToast({
      visible: true,
      message,
      type,
    });
  }, []);

  // Toast kapatma fonksiyonu
  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  // formFields'den başlangıç değerlerini oluştur
  const initialFormData = useMemo(() => {
    const data = {};
    formFields.forEach((field) => {
      if (field.name === "Fotograf_Url") return;

      if (field.type === "boolean") {
        data[field.name] = field.defaultValue || false;
      } else if (field.type === "number") {
        data[field.name] = field.defaultValue || "";
      } else {
        data[field.name] = field.defaultValue || "";
      }
    });
    return data;
  }, []);

  const [formData, setFormData] = useState(initialFormData);

  // Kullanıcının dairelerini çek
  const fetchUserDaireler = useCallback(async () => {
    try {
      setDaireLoading(true);
      const response = await axios.get(`${API_BASE_URL}/daire`);

      const daireListesi = response.data.map((daire) => ({
        ...daire,
        displayName: `${daire.Mahalle || ""} ${daire.Cadde || ""} ${
          daire.Sokak || ""
        } ${daire.Site || daire.Apartman || ""} ${daire.Blok || ""} ${
          daire.Daire || ""
        } ${daire.Ilce || ""} ${daire.Il || ""}`.trim(),
      }));

      setDaireler(daireListesi);
    } catch (error) {
      console.error("Daireler yüklenirken hata:", error);
      setDaireler([]);
      showToast("error", "Daireler yüklenirken bir hata oluştu");
    } finally {
      setDaireLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUserDaireler();
  }, [fetchUserDaireler]);

  useEffect(() => {
    if (initialData) {
      setFormData((prevFormData) => ({ ...prevFormData, ...initialData }));
    }
  }, [initialData]);

  useEffect(() => {
    if (initialData?.Daire_ID && daireler.length > 0) {
      const selectedDaireData = daireler.find(
        (d) => d.Daire_ID === initialData.Daire_ID
      );
      setSelectedDaire(selectedDaireData);
    }
  }, [initialData?.Daire_ID, daireler]);

  useEffect(() => {
    setExistingPhotos(ilanFotograflar);
  }, [ilanFotograflar]);

  // Daire seçildiğinde bilgileri otomatik doldur
  const handleDaireSelection = useCallback((daire) => {
    setSelectedDaire(daire);
    if (daire) {
      setFormData((prev) => ({
        ...prev,
        Daire_ID: daire.Daire_ID,
        daire_adi: daire.displayName,
        Ilan_Il: daire.Il || "",
        Ilan_Ilce: daire.Ilce || "",
        M2: daire.M2 || "",
        Oda_Sayisi: daire.Oda_Sayisi || "",
        Bulundugu_Kat: daire.Bulundugu_Kat || "",
        Kat_Sayisi: daire.Kat_Sayisi || "",
        Bina_Yasi: daire.Bina_Yasi || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        Daire_ID: "",
        daire_adi: "",
      }));
    }
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Fotoğraf seçimi
  const handlePhotoSelection = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "İzin Gerekli",
          "Fotoğraf seçmek için galeri erişim izni gerekli."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.type || "image/jpeg",
        }));

        setSelectedFiles((prev) => [...prev, ...newFiles]);
        showToast("success", `${newFiles.length} fotoğraf seçildi`);
      }
    } catch (error) {
      console.error("Fotoğraf seçme hatası:", error);
      showToast("error", "Fotoğraf seçilirken hata oluştu");
    }
  }, [showToast]);

  // Seçilen fotoğrafı kaldır
  const removeSelectedFile = useCallback(
    (index) => {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
      showToast("info", "Fotoğraf kaldırıldı");
    },
    [showToast]
  );

  // Mevcut fotoğrafı sil
  const deleteExistingPhoto = useCallback(
    async (photoId) => {
      Alert.alert(
        "Fotoğraf Sil",
        "Bu fotoğrafı silmek istediğinize emin misiniz?",
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Sil",
            style: "destructive",
            onPress: async () => {
              try {
                setPhotoUploadLoading(true);
                // await axios.delete(`${API_BASE_URL}/ilan_fotograf/${photoId}`);
                setExistingPhotos((prev) =>
                  prev.filter((photo) => photo.Fotograf_ID !== photoId)
                );
                showToast("success", "Fotoğraf başarıyla silindi");
              } catch (error) {
                console.error("Fotoğraf silinirken hata:", error);
                showToast("error", "Fotoğraf silinirken hata oluştu");
              } finally {
                setPhotoUploadLoading(false);
              }
            },
          },
        ]
      );
    },
    [showToast]
  );

  // Fotoğrafları yükle
  const uploadPhotos = useCallback(
    async (ilanId) => {
      if (selectedFiles.length === 0) return;

      try {
        setPhotoUploadLoading(true);

        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append("file", {
            uri: file.uri,
            type: file.type,
            name: file.name,
          });
          formData.append("Ilan_ID", ilanId);

          // Mock API call - replace with actual implementation
          const photoData = {
            Ilan_ID: ilanId,
            Url: file.uri,
            Fotograf_Aciklama: file.name,
            Tarih: new Date().toISOString().split("T")[0],
          };
        }

        setSelectedFiles([]);
        showToast("success", "Fotoğraflar başarıyla yüklendi");
      } catch (error) {
        console.error("Fotoğraflar yüklenirken hata:", error);
        showToast("error", "Fotoğraflar yüklenirken hata oluştu");
      } finally {
        setPhotoUploadLoading(false);
      }
    },
    [selectedFiles, showToast]
  );

  // Fiyat formatını düzenle
  const formatPrice = useCallback((price) => {
    if (!price) return "";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }, []);

  const unformatPrice = useCallback((formattedPrice) => {
    if (!formattedPrice) return "";
    const priceString = formattedPrice.toString();
    return priceString.replace(/\./g, "");
  }, []);

  const getFieldValue = useCallback(
    (field) => {
      if (field.name === "Fiyat" || field.name === "Depozito") {
        return formatPrice(formData[field.name]);
      }
      return formData[field.name];
    },
    [formData, formatPrice]
  );

  // Field render fonksiyonu
  const renderField = useCallback(
    (field) => {
      if (field.name === "fotograflar") {
        return (
          <View style={styles.photoSection}>
            <Text style={styles.sectionTitle}>{field.label}</Text>

            {/* Fotoğraf Seç Butonu */}
            <TouchableOpacity
              style={styles.photoSelectButton}
              onPress={handlePhotoSelection}
              disabled={photoUploadLoading}
            >
              <Ionicons name="cloud-upload-outline" size={24} color="#3498db" />
              <Text style={styles.photoSelectButtonText}>Fotoğraf Seç</Text>
            </TouchableOpacity>

            {/* Mevcut Fotoğraflar */}
            {existingPhotos.length > 0 && (
              <View style={styles.photoGrid}>
                <Text style={styles.photoGridTitle}>
                  Mevcut Fotoğraflar ({existingPhotos.length})
                </Text>
                <FlatList
                  data={existingPhotos}
                  numColumns={2}
                  keyExtractor={(item) => item.Fotograf_ID.toString()}
                  renderItem={({ item }) => (
                    <PhotoItem
                      photo={item}
                      onDelete={() => deleteExistingPhoto(item.Fotograf_ID)}
                    />
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                />
              </View>
            )}

            {/* Seçilen Fotoğraflar */}
            {selectedFiles.length > 0 && (
              <View style={styles.photoGrid}>
                <Text style={styles.photoGridTitle}>
                  Seçilen Fotoğraflar ({selectedFiles.length})
                </Text>
                <FlatList
                  data={selectedFiles}
                  numColumns={2}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <PhotoItem
                      photo={item}
                      onDelete={() => removeSelectedFile(index)}
                      isNew={true}
                    />
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                />
              </View>
            )}

            {field.helperText && (
              <Text style={styles.helperText}>{field.helperText}</Text>
            )}
          </View>
        );
      }

      const fieldValue = getFieldValue(field);

      if (field.type === "boolean") {
        return (
          <SwitchField
            label={field.label}
            value={fieldValue}
            onValueChange={(value) => handleInputChange(field.name, value)}
          />
        );
      }

      if (field.type === "select") {
        return (
          <CustomSelect
            label={field.label}
            selectedValue={fieldValue}
            onValueChange={(value) => handleInputChange(field.name, value)}
            items={field.options}
            required={field.required}
          />
        );
      }

      const isDescriptionField = field.name === "Ilan_Aciklama";
      const isPriceField = field.name === "Fiyat" || field.name === "Depozito";

      let prefix = "";
      let suffix = "";
      if (isPriceField) {
        suffix = "₺";
      }
      if (field.name === "M2") {
        suffix = "m²";
      }

      return (
        <InputField
          label={field.label}
          value={fieldValue}
          onChangeText={(value) => {
            if (isPriceField) {
              const numericValue = value.replace(/[^0-9]/g, "");
              handleInputChange(field.name, numericValue);
            } else {
              handleInputChange(field.name, value);
            }
          }}
          keyboardType={
            isPriceField || field.type === "number" ? "numeric" : "default"
          }
          placeholder={field.placeholder}
          required={field.required}
          multiline={isDescriptionField}
          prefix={prefix}
          suffix={suffix}
        />
      );
    },
    [
      formData,
      handleInputChange,
      getFieldValue,
      handlePhotoSelection,
      selectedFiles,
      removeSelectedFile,
      existingPhotos,
      deleteExistingPhoto,
      photoUploadLoading,
    ]
  );

  // Form gönderme
  const handleSubmit = async () => {
    if (loading) {
      return;
    }

    // Gerekli alanları kontrol et
    const requiredFields = formFields.filter(
      (field) => field.required && field.name !== "fotograflar"
    );
    const missingFields = requiredFields.filter(
      (field) => !formData[field.name]
    );

    if (missingFields.length > 0 || !formData.Daire_ID) {
      const missingFieldNames = missingFields
        .map((field) => field.label)
        .join(", ");
      showToast(
        "error",
        `Lütfen gerekli alanları doldurun: ${missingFieldNames}${
          !formData.Daire_ID ? ", Daire seçimi" : ""
        }`
      );
      return;
    }

    setLoading(true);
    try {
      // Fiyat formatını temizle ve backend formatına çevir
      const submitData = { ...formData };

      if (submitData.Fiyat) {
        const fiyatValue =
          typeof submitData.Fiyat === "string"
            ? unformatPrice(submitData.Fiyat)
            : submitData.Fiyat.toString().replace(/\./g, "");
        submitData.Fiyat = parseFloat(fiyatValue);
      }

      if (submitData.Depozito) {
        const depozitoValue =
          typeof submitData.Depozito === "string"
            ? unformatPrice(submitData.Depozito)
            : submitData.Depozito.toString().replace(/\./g, "");
        submitData.Depozito = parseFloat(depozitoValue);
      }

      if (submitData.M2) {
        submitData.M2 = parseFloat(submitData.M2);
      }

      // Boş string'leri null yap
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === "" || submitData[key] === undefined) {
          submitData[key] = null;
        }
      });

      delete submitData.daire_adi;

      let response;
      let ilanId;
      let isSuccess = false;

      if (initialData) {
        // Güncelleme
        try {
          response = await axios.put(
            `${API_BASE_URL}/ilan/${initialData.Ilan_ID}`,
            submitData
          );
          ilanId = initialData.Ilan_ID;
          isSuccess = true;
        } catch (putError) {
          if (putError.response?.status === 422) {
            ilanId = initialData.Ilan_ID;
            isSuccess = true;
            response = { data: submitData };
          } else {
            throw putError;
          }
        }
      } else {
        // Yeni ilan oluşturma
        try {
          response = await axios.post(`${API_BASE_URL}/ilan`, submitData);
          ilanId =
            response.data.ilan_id || response.data.Ilan_ID || response.data.id;
          isSuccess = true;
        } catch (postError) {
          if (postError.response?.status === 422) {
            const errorData = postError.response.data;
            ilanId = errorData?.ilan_id || errorData?.Ilan_ID || errorData?.id;

            if (!ilanId) {
              try {
                const ilanlarResponse = await axios.get(`${API_BASE_URL}/ilan`);
                const sonIlan = ilanlarResponse.data.sort(
                  (a, b) =>
                    new Date(b.created_at || b.Tarih) -
                    new Date(a.created_at || a.Tarih)
                )[0];
                ilanId = sonIlan?.Ilan_ID || sonIlan?.id;
              } catch (getError) {
                console.log("Son ilan ID'si alınamadı:", getError);
              }
            }

            isSuccess = true;
            response = { data: { ...submitData, ilan_id: ilanId } };
          } else {
            throw postError;
          }
        }
      }

      // İşlem başarılıysa
      if (isSuccess) {
        // Fotoğrafları yükle - SADECE eğer seçilen dosyalar varsa
        if (selectedFiles.length > 0 && ilanId) {
          try {
            await uploadPhotos(ilanId);
          } catch (photoError) {
            console.log("Fotoğraf yükleme hatası:", photoError);
            showToast(
              "warning",
              "İlan oluşturuldu ancak fotoğraflar yüklenirken hata oluştu"
            );
          }
        }

        // Başarı mesajını göster
        showToast(
          "success",
          initialData
            ? "İlan başarıyla güncellendi!"
            : "İlan başarıyla oluşturuldu!"
        );

        // Başarılı olduğunda callback'i çağır - 1.5 saniye sonra
        setTimeout(() => {
          if (onSave) {
            onSave(response.data);
          }
        }, 1500);
      }
    } catch (error) {
      console.error("İlan kaydedilirken hata:", error);

      let errorMessage = "İlan kaydedilirken bir hata oluştu.";
      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail
              .map((err) => err.msg || err.message || err)
              .join(", ");
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }

      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Daire seçenekleri
  const daireOptions = daireler.map((daire) => ({
    label: daire.displayName,
    value: daire.Daire_ID,
    data: daire,
  }));

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Daire Seçimi */}
          <View style={styles.section}>
            <CustomSelect
              label="Daire Seçin"
              selectedValue={selectedDaire?.Daire_ID}
              onValueChange={(value) => {
                const daire = daireler.find((d) => d.Daire_ID === value);
                handleDaireSelection(daire || null);
              }}
              items={daireOptions}
              placeholder={
                daireLoading
                  ? "Daireler yükleniyor..."
                  : "Dairelerinizden birini seçin"
              }
              disabled={daireLoading || daireler.length === 0}
              required={true}
            />

            {selectedDaire && (
              <View style={styles.chipContainer}>
                <Chip
                  label={`Seçili: ${selectedDaire.displayName}`}
                  color="info"
                />
              </View>
            )}
          </View>

          {/* Dinamik Form Alanları */}
          {formFields
            .filter((field) => {
              if (field.hidden) return false;
              if (field.name === "Depozito" && formData.Ilan_Turu === "satilik")
                return false;
              return true;
            })
            .map((field) => {
              const isFullWidth =
                field.name === "Ilan_Aciklama" ||
                field.name === "Ozellikler" ||
                field.name === "Fotograf_Url" ||
                field.name === "fotograflar";

              return (
                <View
                  key={field.name}
                  style={[
                    styles.fieldContainer,
                    isFullWidth ? styles.fullWidth : styles.halfWidth,
                  ]}
                >
                  {renderField(field)}
                </View>
              );
            })}
        </View>
      </ScrollView>

      {/* Form Butonları */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={loading || photoUploadLoading}
        >
          <Text style={styles.cancelButtonText}>İptal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || photoUploadLoading) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={loading || photoUploadLoading}
        >
          {loading && (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={styles.buttonLoader}
            />
          )}
          <Text style={styles.submitButtonText}>
            {loading ? "Kaydediliyor..." : initialData ? "Güncelle" : "Oluştur"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100, // Action container için yer bırak
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fullWidth: {
    width: "100%",
  },
  halfWidth: {
    width: "48%",
    marginHorizontal: "1%",
  },
  chipContainer: {
    marginTop: 10,
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
  requiredLabel: {
    color: "#e74c3c",
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
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
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
  // Switch Styles
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  // Photo Styles
  photoSection: {
    marginBottom: 20,
  },
  photoSelectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#3498db",
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  photoSelectButtonText: {
    color: "#3498db",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  photoGrid: {
    marginBottom: 15,
  },
  photoGridTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  photoItem: {
    flex: 0.48,
    marginHorizontal: "1%",
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 10,
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  photoDeleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
  },
  photoCaption: {
    padding: 8,
  },
  photoCaptionText: {
    fontSize: 12,
    color: "#666",
  },
  // Chip Styles
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  chipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  // Action Container
  actionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#3498db",
    flexDirection: "row",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#95a5a6",
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonLoader: {
    marginRight: 8,
  },
  // Toast Styles
  toast: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  toastCloseButton: {
    padding: 4,
  },
});

export default IlanForm;
