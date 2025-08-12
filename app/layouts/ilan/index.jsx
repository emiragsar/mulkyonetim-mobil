import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// Custom components
import PageLayout from "@/app/components/shared/PageLayout.jsx";
import API_BASE_URL from "@/config/api";
import IlanFilters from "./IlanFilters";
import IlanForm from "./IlanForm";

const { width } = Dimensions.get("window");

const Ilan = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "Evet",
    cancelText: "Hayır",
    severity: "error",
  });

  const [ilanlar, setIlanlar] = useState([]);
  const [messageType, setMessageType] = useState("");
  const [messageText, setMessageText] = useState("");
  const [daireler, setDaireler] = useState([]);
  const [ilanFotograflar, setIlanFotograflar] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [editingIlan, setEditingIlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filters, setFilters] = useState(() => {
    // In React Native, you'd use AsyncStorage instead of localStorage
    return {
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
    };
  });

  const showConfirmDialog = (title, message, onConfirm, options = {}) => {
    setConfirmDialog({
      visible: true,
      title,
      message,
      onConfirm,
      confirmText: options.confirmText || "Evet",
      cancelText: options.cancelText || "Hayır",
      severity: options.severity || "error",
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, visible: false }));
  };

  const handleConfirmAction = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    handleCloseConfirmDialog();
  };

  const fetchIlanFotograflar = async (ilanId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/ilan_fotograf?Ilan_ID=${ilanId}`
      );
      return response.data;
    } catch (error) {
      console.error(`İlan ${ilanId} fotoğrafları yüklenirken hata:`, error);
      return [];
    }
  };

  const handleShowMessage = (type, message) => {
    setMessageType(type);
    setMessageText(message);

    setTimeout(() => {
      setMessageText("");
      setMessageType("");
    }, 5000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ilanResponse, daireResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/ilan`),
        axios.get(`${API_BASE_URL}/daire`),
      ]);

      const daireMap = {};
      daireResponse.data.forEach((daire) => {
        daireMap[daire.Daire_ID] = {
          ...daire,
          displayName: `${daire.Mahalle || ""} ${daire.Cadde || ""} ${
            daire.Sokak || ""
          } ${daire.Site || daire.Apartman || ""} ${daire.Blok || ""} ${
            daire.Daire || ""
          } ${daire.Ilce || ""} ${daire.Il || ""}`.trim(),
        };
      });

      const ilanlarWithDaire = ilanResponse.data.map((ilan) => ({
        ...ilan,
        daire_bilgisi: daireMap[ilan.Daire_ID] || null,
      }));

      setIlanlar(ilanlarWithDaire);
      setDaireler(daireResponse.data);

      const fotograflarMap = {};
      await Promise.all(
        ilanResponse.data.map(async (ilan) => {
          const fotograflar = await fetchIlanFotograflar(ilan.Ilan_ID);
          fotograflarMap[ilan.Ilan_ID] = fotograflar;
        })
      );

      setIlanFotograflar(fotograflarMap);
    } catch (error) {
      console.error("Veriler yüklenirken hata:", error);
      setError("Veriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatPrice = (price) => {
    if (!price) return "";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const resetForm = () => {
    setEditingIlan(null);
  };

  const handleEdit = (ilan) => {
    setEditingIlan(ilan);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
    setError("");
    setSuccess("");
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setOpenDialog(true);
    setError("");
    setSuccess("");
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // In React Native, use AsyncStorage instead
    // AsyncStorage.setItem("ilanFilters", JSON.stringify(newFilters));
  };

  const handleSaveIlan = async (ilanData) => {
    if (isSubmitting) {
      console.log("Zaten bir işlem devam ediyor, ignore ediliyor");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("İlan kaydediliyor:", ilanData);
      await fetchData();
      handleCloseDialog();
      setSuccess(
        editingIlan
          ? "✅ İlan başarıyla güncellendi!"
          : "✅ İlan başarıyla oluşturuldu!"
      );
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      console.error("Parent save error:", error);
      setError("❌ İlan kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (ilanId, permanent = false) => {
    const title = permanent ? "Kalıcı Silme" : "İlan Pasif Yapma";
    const message = permanent
      ? `Bu ilanı KALICI olarak silmek istediğinizden emin misiniz? 
         
         ⚠️ Bu işlem geri alınamaz!
         ⚠️ İlan ve tüm fotoğrafları tamamen silinecek!`
      : `Bu ilanı pasif yapmak istediğinizden emin misiniz?
         
         ℹ️ İlan görünmez hale gelecek ancak daha sonra tekrar aktif yapabilirsiniz.`;

    showConfirmDialog(
      title,
      message,
      async () => {
        try {
          const endpoint = permanent
            ? `${API_BASE_URL}/ilan/${ilanId}/permanent`
            : `${API_BASE_URL}/ilan/${ilanId}`;

          await axios.delete(endpoint);

          if (permanent) {
            setIlanlar((prev) =>
              prev.filter((ilan) => ilan.Ilan_ID !== ilanId)
            );
            setSuccess("✅ İlan kalıcı olarak silindi");
          } else {
            setIlanlar((prev) =>
              prev.map((ilan) =>
                ilan.Ilan_ID === ilanId ? { ...ilan, Aktif: false } : ilan
              )
            );
            setSuccess("✅ İlan pasif yapıldı");
          }

          setTimeout(() => setSuccess(""), 4000);
        } catch (error) {
          console.error("İlan silinirken hata:", error);
          setError("❌ İlan silinirken bir hata oluştu");
          setTimeout(() => setError(""), 4000);
        }
      },
      {
        confirmText: permanent ? "Kalıcı Sil" : "Pasif Yap",
        cancelText: "İptal",
        severity: permanent ? "error" : "warning",
      }
    );
  };

  const handleToggleActive = async (ilanId) => {
    const ilan = ilanlar.find((i) => i.Ilan_ID === ilanId);
    const newStatus = !ilan.Aktif;

    const title = newStatus ? "İlan Aktif Yapma" : "İlan Pasif Yapma";
    const message = newStatus
      ? "Bu ilanı aktif hale getirmek istediğinizden emin misiniz?"
      : "Bu ilanı pasif yapmak istediğinizden emin misiniz?";

    showConfirmDialog(
      title,
      message,
      async () => {
        try {
          await axios.patch(`${API_BASE_URL}/ilan/${ilanId}/toggle-active`);
          setIlanlar((prev) =>
            prev.map((ilan) =>
              ilan.Ilan_ID === ilanId ? { ...ilan, Aktif: newStatus } : ilan
            )
          );
          setSuccess(
            newStatus
              ? "✅ İlan aktif hale getirildi"
              : "✅ İlan pasif hale getirildi"
          );
          setTimeout(() => setSuccess(""), 4000);
        } catch (error) {
          console.error("İlan durumu güncellenirken hata:", error);
          setError("❌ İlan durumu güncellenirken bir hata oluştu");
          setTimeout(() => setError(""), 4000);
        }
      },
      {
        confirmText: newStatus ? "Aktif Yap" : "Pasif Yap",
        cancelText: "İptal",
        severity: newStatus ? "info" : "warning",
      }
    );
  };

  const getMainPhoto = (ilanId) => {
    const fotograflar = ilanFotograflar[ilanId] || [];
    if (fotograflar.length > 0) {
      return fotograflar[0].Url;
    }

    const ilan = ilanlar.find((i) => i.Ilan_ID === ilanId);
    if (ilan?.Fotograf_Url) {
      const urls = ilan.Fotograf_Url.split(",")
        .map((url) => url.trim())
        .filter((url) => url);
      if (urls.length > 0) {
        return urls[0];
      }
    }

    return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
  };

  const filteredIlanlar = ilanlar.filter((ilan) => {
    if (filters.durum === "aktif" && !ilan.Aktif) return false;
    if (filters.durum === "pasif" && ilan.Aktif) return false;
    if (filters.Ilan_Turu !== "all" && ilan.Ilan_Turu !== filters.Ilan_Turu)
      return false;
    if (filters.Ilan_Il && ilan.Ilan_Il !== filters.Ilan_Il) return false;
    if (filters.Ilan_Ilce && ilan.Ilan_Ilce !== filters.Ilan_Ilce) return false;
    if (filters.fiyat_min && ilan.Fiyat < parseFloat(filters.fiyat_min))
      return false;
    if (filters.fiyat_max && ilan.Fiyat > parseFloat(filters.fiyat_max))
      return false;
    if (filters.Esya === "true" && !ilan.Esya) return false;
    if (filters.Esya === "false" && ilan.Esya) return false;
    if (filters.Oda_Sayisi && ilan.Oda_Sayisi !== filters.Oda_Sayisi)
      return false;
    if (filters.m2_min && ilan.M2 < parseFloat(filters.m2_min)) return false;
    if (filters.m2_max && ilan.M2 > parseFloat(filters.m2_max)) return false;

    if (filters.arama) {
      const searchTerm = filters.arama.toLowerCase();
      return (
        (ilan.Ilan_Baslik &&
          ilan.Ilan_Baslik.toLowerCase().includes(searchTerm)) ||
        (ilan.Ilan_Aciklama &&
          ilan.Ilan_Aciklama.toLowerCase().includes(searchTerm)) ||
        (ilan.daire_bilgisi &&
          ilan.daire_bilgisi.displayName.toLowerCase().includes(searchTerm)) ||
        (ilan.Ozellikler && ilan.Ozellikler.toLowerCase().includes(searchTerm))
      );
    }

    return true;
  });

  const renderIlanCard = ({ item: ilan }) => {
    const mainPhoto = getMainPhoto(ilan.Ilan_ID);

    return (
      <TouchableOpacity
        style={[styles.card, { opacity: ilan.Aktif ? 1 : 0.6 }]}
        onPress={() => {
          navigation.navigate("ilan-detay/index", {
            ilanId: ilan.Ilan_ID,
            returnTo: route.name,
            filters: filters,
          });
        }}
      >
        <Image source={{ uri: mainPhoto }} style={styles.cardImage} />

        <View style={styles.cardContent}>
          <View style={styles.chipContainer}>
            <View style={[styles.chip, styles.chipPrimary]}>
              <Text style={styles.chipText}>
                {ilan.Ilan_Turu === "kiralik" ? "Kiralık" : "Satılık"}
              </Text>
            </View>
            <View
              style={[
                styles.chip,
                ilan.Aktif ? styles.chipSuccess : styles.chipDefault,
              ]}
            >
              <Text style={styles.chipText}>
                {ilan.Aktif ? "Aktif" : "Pasif"}
              </Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>
            {ilan.Ilan_Baslik || "Başlık Yok"}
          </Text>

          <View style={styles.infoRow}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.infoText}>
              {ilan.Ilan_Il || "Belirtilmemiş"} /{" "}
              {ilan.Ilan_Ilce || "Belirtilmemiş"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="home" size={16} color="#666" />
            <Text style={styles.infoText}>
              {ilan.Oda_Sayisi || "Belirtilmemiş"} • {ilan.M2 || 0} m²
            </Text>
          </View>

          {ilan.daire_bilgisi && (
            <Text style={styles.daireInfo}>
              Daire: {ilan.daire_bilgisi.displayName}
            </Text>
          )}

          <Text style={styles.description}>
            {ilan.Ilan_Aciklama?.substring(0, 100) ||
              "Açıklama bulunmamaktadır"}
            {ilan.Ilan_Aciklama?.length > 100 && "..."}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatPrice(ilan.Fiyat)} ₺{ilan.Ilan_Turu === "kiralik" && "/ay"}
            </Text>
            {ilan.Esya && (
              <View style={[styles.chip, styles.chipInfo]}>
                <Text style={styles.chipText}>Eşyalı</Text>
              </View>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleEdit(ilan);
              }}
              disabled={isSubmitting}
            >
              <Icon name="edit" size={20} color="#2196F3" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleToggleActive(ilan.Ilan_ID);
              }}
            >
              <Icon
                name={ilan.Aktif ? "visibility-off" : "visibility"}
                size={20}
                color={ilan.Aktif ? "#FF9800" : "#4CAF50"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDelete(ilan.Ilan_ID, true);
              }}
            >
              <Icon name="delete" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const MessageAlert = ({ type, message, onClose }) => {
    if (!message) return null;

    const getAlertStyle = () => {
      switch (type) {
        case "success":
          return styles.alertSuccess;
        case "error":
          return styles.alertError;
        case "warning":
          return styles.alertWarning;
        default:
          return styles.alertInfo;
      }
    };

    return (
      <View style={[styles.alert, getAlertStyle()]}>
        <Text style={styles.alertText}>{message}</Text>
        <TouchableOpacity onPress={onClose} style={styles.alertClose}>
          <Icon name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <PageLayout title="Mülk İlanları" onRefresh={fetchData}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Mülk İlanları ({filteredIlanlar.length})
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setOpenFilters(true)}
            >
              <Icon name="filter-list" size={20} color="#fff" />
              <Text style={styles.buttonText}>Filtrele</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleOpenCreateDialog}
              disabled={isSubmitting}
            >
              <Text style={styles.addButtonText}>Yeni İlan Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Alerts */}
        <MessageAlert
          type="error"
          message={error}
          onClose={() => setError("")}
        />
        <MessageAlert
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
        <MessageAlert
          type={messageType}
          message={messageText}
          onClose={() => {
            setMessageText("");
            setMessageType("");
          }}
        />

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        ) : filteredIlanlar.length > 0 ? (
          filteredIlanlar.map((item) => (
            <View key={item.Ilan_ID} style={styles.listContainer}>
              {renderIlanCard({ item })}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {ilanlar.length === 0
                ? "Henüz hiç ilan bulunmamaktadır"
                : "Filtre kriterlerine uygun ilan bulunamadı"}
            </Text>
          </View>
        )}

        {/* İlan Form Modal */}
        <Modal
          visible={openDialog}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseDialog}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingIlan ? "İlan Düzenle" : "Yeni İlan Oluştur"}
                {isSubmitting && " - Kaydediliyor..."}
              </Text>
              <TouchableOpacity
                onPress={handleCloseDialog}
                style={styles.modalCloseButton}
                disabled={isSubmitting}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <IlanForm
                key={editingIlan?.Ilan_ID || "new"}
                initialData={editingIlan}
                onSave={handleSaveIlan}
                onCancel={handleCloseDialog}
                onShowMessage={handleShowMessage}
                ilanFotograflar={
                  editingIlan ? ilanFotograflar[editingIlan.Ilan_ID] || [] : []
                }
              />
            </ScrollView>
          </View>
        </Modal>

        {/* Filters Modal */}
        <IlanFilters
          visible={openFilters}
          onClose={() => setOpenFilters(false)}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Confirmation Dialog */}
        <Modal
          visible={confirmDialog.visible}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseConfirmDialog}
        >
          <View style={styles.confirmDialogOverlay}>
            <View style={styles.confirmDialog}>
              <Text
                style={[
                  styles.confirmDialogTitle,
                  confirmDialog.severity === "error" &&
                    styles.confirmTitleError,
                  confirmDialog.severity === "warning" &&
                    styles.confirmTitleWarning,
                  confirmDialog.severity === "info" && styles.confirmTitleInfo,
                ]}
              >
                {confirmDialog.title}
              </Text>
              <Text style={styles.confirmDialogMessage}>
                {confirmDialog.message}
              </Text>
              <View style={styles.confirmDialogButtons}>
                <TouchableOpacity
                  style={styles.confirmCancelButton}
                  onPress={handleCloseConfirmDialog}
                >
                  <Text style={styles.confirmCancelText}>
                    {confirmDialog.cancelText}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmActionButton}
                  onPress={handleConfirmAction}
                >
                  <Text style={styles.confirmActionText}>
                    {confirmDialog.confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2196F3",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  addButtonText: {
    color: "#2196F3",
    fontSize: 12,
    fontWeight: "500",
  },
  alert: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertSuccess: {
    backgroundColor: "#4CAF50",
  },
  alertError: {
    backgroundColor: "#F44336",
  },
  alertWarning: {
    backgroundColor: "#FF9800",
  },
  alertInfo: {
    backgroundColor: "#2196F3",
  },
  alertText: {
    color: "#fff",
    flex: 1,
    fontSize: 14,
  },
  alertClose: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 16,
  },
  chipContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipPrimary: {
    backgroundColor: "#2196F3",
  },
  chipSuccess: {
    backgroundColor: "#4CAF50",
  },
  chipDefault: {
    backgroundColor: "#9E9E9E",
  },
  chipInfo: {
    backgroundColor: "#00BCD4",
  },
  chipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  daireInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
  },
  confirmDialogOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confirmDialog: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    minWidth: width * 0.8,
    maxWidth: width * 0.9,
  },
  confirmDialogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  confirmTitleError: {
    color: "#F44336",
  },
  confirmTitleWarning: {
    color: "#FF9800",
  },
  confirmTitleInfo: {
    color: "#2196F3",
  },
  confirmDialogMessage: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    lineHeight: 22,
    textAlign: "left",
  },
  confirmDialogButtons: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  confirmCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2196F3",
    minWidth: 80,
  },
  confirmActionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: "#2196F3",
    minWidth: 80,
  },
  confirmCancelText: {
    color: "#2196F3",
    fontWeight: "500",
    textAlign: "center",
  },
  confirmActionText: {
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
  },
});

export default Ilan;
