import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Custom components
import DashboardLayout from "@/app/components/dashboardlayout";
import API_BASE_URL from "@/config/api";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Chip Component
const Chip = ({ label, color = "primary", size = "medium", icon }) => {
  const getChipColor = () => {
    switch (color) {
      case "primary":
        return "#3498db";
      case "secondary":
        return "#9b59b6";
      case "success":
        return "#27ae60";
      case "info":
        return "#17a2b8";
      case "warning":
        return "#f39c12";
      case "error":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const getChipSize = () => {
    switch (size) {
      case "small":
        return { paddingHorizontal: 8, paddingVertical: 4, fontSize: 10 };
      case "large":
        return { paddingHorizontal: 16, paddingVertical: 8, fontSize: 14 };
      default:
        return { paddingHorizontal: 12, paddingVertical: 6, fontSize: 12 };
    }
  };

  const chipSize = getChipSize();

  return (
    <View style={[styles.chip, { backgroundColor: getChipColor() }, chipSize]}>
      {icon && (
        <Ionicons
          name={icon}
          size={chipSize.fontSize + 2}
          color="#fff"
          style={{ marginRight: 4 }}
        />
      )}
      <Text style={[styles.chipText, { fontSize: chipSize.fontSize }]}>
        {label}
      </Text>
    </View>
  );
};

// Image Gallery Component
const ImageGallery = ({ fotograflar, ilan, currentIndex, onIndexChange }) => {
  const defaultImageUrl =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

  const getTotalPhotosCount = () => {
    let count = fotograflar.length;

    if (ilan?.Fotograf_Url) {
      const urls = ilan.Fotograf_Url.split(",")
        .map((url) => url.trim())
        .filter((url) => url);
      const uniqueUrls = urls.filter((url) => {
        return !fotograflar.some((foto) => foto.Url === url);
      });
      count += uniqueUrls.length;
    }

    return count;
  };

  const totalPhotos = getTotalPhotosCount();

  const nextImage = () => {
    if (totalPhotos > 1) {
      const newIndex = currentIndex === totalPhotos - 1 ? 0 : currentIndex + 1;
      onIndexChange(newIndex);
    }
  };

  const prevImage = () => {
    if (totalPhotos > 1) {
      const newIndex = currentIndex === 0 ? totalPhotos - 1 : currentIndex - 1;
      onIndexChange(newIndex);
    }
  };

  const getCurrentImageUrl = () => {
    if (fotograflar && fotograflar.length > 0) {
      if (currentIndex < fotograflar.length) {
        return fotograflar[currentIndex]?.Url || defaultImageUrl;
      }
    }

    if (ilan?.Fotograf_Url) {
      const urls = ilan.Fotograf_Url.split(",")
        .map((url) => url.trim())
        .filter((url) => url);
      if (urls.length > 0) {
        const urlIndex = currentIndex - fotograflar.length;
        return urls[urlIndex] || urls[0];
      }
    }

    return defaultImageUrl;
  };

  const getAllPhotos = () => {
    let allPhotos = [...fotograflar];

    if (ilan?.Fotograf_Url) {
      const urls = ilan.Fotograf_Url.split(",")
        .map((url) => url.trim())
        .filter((url) => url);
      const uniqueUrls = urls.filter((url) => {
        return !fotograflar.some((foto) => foto.Url === url);
      });
      uniqueUrls.forEach((url, index) => {
        allPhotos.push({
          Fotograf_ID: `url-${index}`,
          Url: url,
          Fotograf_Aciklama: `İlan Fotoğrafı ${index + 1}`,
        });
      });
    }

    return allPhotos;
  };

  const allPhotos = getAllPhotos();

  const renderThumbnail = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => onIndexChange(index)}
      style={[
        styles.thumbnail,
        currentIndex === index && styles.activeThumbnail,
      ]}
    >
      <Image
        source={{ uri: item.Url }}
        style={styles.thumbnailImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.imageGalleryContainer}>
      <View style={styles.mainImageContainer}>
        <Image
          source={{ uri: getCurrentImageUrl() }}
          style={styles.mainImage}
          resizeMode="cover"
        />

        {/* Photo Counter */}
        {totalPhotos > 1 && (
          <View style={styles.photoCounter}>
            <Text style={styles.photoCounterText}>
              {currentIndex + 1} / {totalPhotos}
            </Text>
          </View>
        )}

        {/* Navigation Buttons */}
        {totalPhotos > 1 && (
          <View style={styles.navigationButtons}>
            <TouchableOpacity style={styles.navButton} onPress={prevImage}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={nextImage}>
              <Ionicons name="chevron-forward" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Thumbnail Strip */}
      {allPhotos.length > 1 && (
        <FlatList
          data={allPhotos}
          renderItem={renderThumbnail}
          keyExtractor={(item, index) => item.Fotograf_ID || index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailStrip}
          contentContainerStyle={styles.thumbnailContainer}
        />
      )}
    </View>
  );
};

// Contact Button Component
const ContactButton = ({ type, value, onPress, style }) => {
  const getButtonConfig = () => {
    switch (type) {
      case "phone":
        return {
          icon: "call",
          color: "#3498db",
          label: value,
        };
      case "email":
        return {
          icon: "mail",
          color: "#27ae60",
          label: "E-posta Gönder",
        };
      case "reservation":
        return {
          icon: "calendar",
          color: "#e74c3c",
          label: "Rezervasyon Yap",
        };
      default:
        return {
          icon: "information-circle",
          color: "#95a5a6",
          label: "İletişim",
        };
    }
  };

  const config = getButtonConfig();

  return (
    <TouchableOpacity
      style={[styles.contactButton, { backgroundColor: config.color }, style]}
      onPress={onPress}
    >
      <Ionicons name={config.icon} size={20} color="#fff" />
      <Text style={styles.contactButtonText}>{config.label}</Text>
    </TouchableOpacity>
  );
};

const IlanDetay = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { ilanId, returnTo } = route.params;

  const [ilan, setIlan] = useState(null);
  const [daire, setDaire] = useState(null);
  const [fotograflar, setFotograflar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fotografLoading, setFotografLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Varsayılan fotoğraf URL'i
  const defaultImageUrl =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

  // Fiyat formatlama fonksiyonu
  const formatPrice = (price) => {
    if (!price) return "0";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Tarih formatlama
  const formatDate = (dateString) => {
    if (!dateString) return "Belirtilmemiş";
    try {
      return new Date(dateString).toLocaleDateString("tr-TR");
    } catch {
      return "Belirtilmemiş";
    }
  };

  // İlan fotoğraflarını getir
  const fetchIlanFotograflar = async () => {
    try {
      setFotografLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/ilan_fotograf?Ilan_ID=${ilanId}`
      );
      console.log("İlan fotoğrafları:", response.data);
      setFotograflar(response.data || []);
    } catch (error) {
      console.error("İlan fotoğrafları yüklenirken hata:", error);
      setFotograflar([]);
    } finally {
      setFotografLoading(false);
    }
  };

  // İlan ve daire bilgilerini getir
  const fetchIlanDetay = async () => {
    try {
      setLoading(true);
      setError("");

      // İlan bilgisini getir
      const ilanResponse = await axios.get(`${API_BASE_URL}/ilan/${ilanId}`);
      const ilanData = ilanResponse.data;
      setIlan(ilanData);

      // Daire bilgisini getir
      if (ilanData.Daire_ID) {
        try {
          const daireResponse = await axios.get(
            `${API_BASE_URL}/daire?Daire_ID=${ilanData.Daire_ID}`
          );
          if (daireResponse.data && daireResponse.data.length > 0) {
            const daireData = daireResponse.data[0];
            daireData.displayName = `${daireData.Mahalle || ""} ${
              daireData.Cadde || ""
            } ${daireData.Sokak || ""} ${
              daireData.Site || daireData.Apartman || ""
            } ${daireData.Blok || ""} ${daireData.Daire || ""} ${
              daireData.Ilce || ""
            } ${daireData.Il || ""}`.trim();
            setDaire(daireData);
          }
        } catch (daireError) {
          console.error("Daire bilgisi alınırken hata:", daireError);
        }
      }

      await fetchIlanFotograflar();
    } catch (error) {
      console.error("İlan detayı yüklenirken hata:", error);
      if (error.response?.status === 404) {
        setError("İlan bulunamadı");
      } else {
        setError("İlan bilgileri yüklenirken bir hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ilanId) {
      fetchIlanDetay();
    }
  }, [ilanId]);

  // İletişim fonksiyonları
  const handlePhoneCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleReservation = () => {
    navigation.navigate("rezervasyon/index", { ilanId: ilan.Ilan_ID });
  };

  const handleGoBack = () => {
    if (returnTo) {
      navigation.navigate(returnTo);
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>İlan bilgileri yükleniyor...</Text>
        </View>
      </DashboardLayout>
    );
  }

  if (error || !ilan) {
    return (
      <DashboardLayout>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>{error || "İlan bulunamadı"}</Text>
          <TouchableOpacity style={styles.errorButton} onPress={handleGoBack}>
            <Text style={styles.errorButtonText}>İlanlar Sayfasına Dön</Text>
          </TouchableOpacity>
        </View>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>İlan Detayı #{ilan.Ilan_ID}</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Gallery */}
          <ImageGallery
            fotograflar={fotograflar}
            ilan={ilan}
            currentIndex={currentImageIndex}
            onIndexChange={setCurrentImageIndex}
          />

          {/* İlan Bilgileri Container */}
          <View style={styles.infoContainer}>
            {/* Status Badges */}
            <View style={styles.statusBadges}>
              <Chip
                label={
                  ilan.Ilan_Turu === "kiralik"
                    ? "Kiralık"
                    : ilan.Ilan_Turu === "satilik"
                    ? "Satılık"
                    : "Kısa Dönem"
                }
                color={
                  ilan.Ilan_Turu === "kiralik"
                    ? "primary"
                    : ilan.Ilan_Turu === "satilik"
                    ? "secondary"
                    : "warning"
                }
                size="medium"
              />
              <Chip
                label={ilan.Aktif ? "Aktif" : "Pasif"}
                color={ilan.Aktif ? "success" : "default"}
                size="medium"
              />
              {ilan.Esya && <Chip label="Eşyalı" color="info" size="medium" />}
            </View>

            {/* Başlık */}
            <Text style={styles.title}>
              {ilan.Ilan_Baslik || "İlan Başlığı Belirtilmemiş"}
            </Text>

            {/* Fiyat */}
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {formatPrice(ilan.Fiyat)} ₺
                {ilan.Ilan_Turu === "kiralik" && (
                  <Text style={styles.priceUnit}>/ay</Text>
                )}
              </Text>
              {ilan.Ilan_Turu === "kiralik" && ilan.Depozito && (
                <Text style={styles.deposit}>
                  Depozito: {formatPrice(ilan.Depozito)} ₺
                </Text>
              )}
            </View>

            {/* Temel Bilgiler */}
            <View style={styles.basicInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color="#3498db" />
                <Text style={styles.infoText}>
                  {ilan.Ilan_Il || "Belirtilmemiş"} /{" "}
                  {ilan.Ilan_Ilce || "Belirtilmemiş"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="home" size={20} color="#3498db" />
                <Text style={styles.infoText}>
                  {ilan.Oda_Sayisi || "Belirtilmemiş"} • {ilan.M2 || 0} m²
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color="#3498db" />
                <Text style={styles.infoText}>
                  İlan Tarihi: {formatDate(ilan.Olusturma_Tarihi)}
                </Text>
              </View>

              {daire && (
                <View style={styles.infoRow}>
                  <Ionicons name="business" size={20} color="#3498db" />
                  <Text style={styles.infoText}>
                    Daire: {daire.displayName}
                  </Text>
                </View>
              )}
            </View>

            {/* Detaylı Özellikler */}
            {/* Detaylı Özellikler */}
            <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Detaylar</Text>

              {ilan.Bulundugu_Kat && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bulunduğu Kat:</Text>
                  <Text style={styles.detailValue}>{ilan.Bulundugu_Kat}</Text>
                </View>
              )}

              {ilan.Bina_Yasi && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bina Yaşı:</Text>
                  <Text style={styles.detailValue}>{ilan.Bina_Yasi}</Text>
                </View>
              )}

              {ilan.Kat_Sayisi && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Kat Sayısı:</Text>
                  <Text style={styles.detailValue}>{ilan.Kat_Sayisi}</Text>
                </View>
              )}

              {ilan.Mutfak && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Mutfak:</Text>
                  <Text style={styles.detailValue}>
                    {ilan.Mutfak.charAt(0).toUpperCase() + ilan.Mutfak.slice(1)}
                  </Text>
                </View>
              )}

              {ilan.Banyo_Sayisi && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Banyo Sayısı:</Text>
                  <Text style={styles.detailValue}>{ilan.Banyo_Sayisi}</Text>
                </View>
              )}

              {ilan.Isitma && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Isıtma:</Text>
                  <Text style={styles.detailValue}>
                    {ilan.Isitma.charAt(0).toUpperCase() + ilan.Isitma.slice(1)}
                  </Text>
                </View>
              )}

              {ilan.Otopark && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Otopark:</Text>
                  <Text style={styles.detailValue}>
                    {ilan.Otopark.charAt(0).toUpperCase() +
                      ilan.Otopark.slice(1)}
                  </Text>
                </View>
              )}

              {ilan.Asansor !== undefined && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Asansör:</Text>
                  <Text style={styles.detailValue}>
                    {ilan.Asansor ? "Var" : "Yok"}
                  </Text>
                </View>
              )}
            </View>

            {/* Açıklama */}
            {ilan.Ilan_Aciklama && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>Açıklama</Text>
                <Text style={styles.description}>{ilan.Ilan_Aciklama}</Text>
              </View>
            )}

            {/* Özellikler */}
            {ilan.Ozellikler && (
              <View style={styles.featuresContainer}>
                <Text style={styles.sectionTitle}>Özellikler</Text>
                <View style={styles.features}>
                  {ilan.Ozellikler.split(",").map((ozellik, index) => (
                    <Chip
                      key={index}
                      label={ozellik.trim()}
                      color="info"
                      size="small"
                      icon="checkmark-circle"
                    />
                  ))}
                </View>
              </View>
            )}

            {/* İletişim Butonları */}
            <View style={styles.contactContainer}>
              <Text style={styles.sectionTitle}>İletişim</Text>

              {ilan.Ilan_Turu === "kisadonemli_kiralik" && (
                <ContactButton
                  type="reservation"
                  onPress={handleReservation}
                  style={{ marginBottom: 12 }}
                />
              )}

              {ilan.Iletisim_Telefon && (
                <ContactButton
                  type="phone"
                  value={ilan.Iletisim_Telefon}
                  onPress={() => handlePhoneCall(ilan.Iletisim_Telefon)}
                  style={{ marginBottom: 12 }}
                />
              )}

              {ilan.Iletisim_Email && (
                <ContactButton
                  type="email"
                  value={ilan.Iletisim_Email}
                  onPress={() => handleEmail(ilan.Iletisim_Email)}
                />
              )}
            </View>

            {/* İletişim Bilgileri Detayı */}
            {(ilan.Iletisim_Telefon || ilan.Iletisim_Email) && (
              <View style={styles.contactInfoContainer}>
                <Text style={styles.sectionTitle}>İletişim Bilgileri</Text>

                {ilan.Iletisim_Telefon && (
                  <View style={styles.contactInfoRow}>
                    <Ionicons name="call" size={24} color="#3498db" />
                    <View style={styles.contactInfoText}>
                      <Text style={styles.contactInfoLabel}>Telefon</Text>
                      <Text style={styles.contactInfoValue}>
                        {ilan.Iletisim_Telefon}
                      </Text>
                    </View>
                  </View>
                )}

                {ilan.Iletisim_Email && (
                  <View style={styles.contactInfoRow}>
                    <Ionicons name="mail" size={24} color="#3498db" />
                    <View style={styles.contactInfoText}>
                      <Text style={styles.contactInfoLabel}>E-posta</Text>
                      <Text style={styles.contactInfoValue}>
                        {ilan.Iletisim_Email}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498db",
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#7f8c8d",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 16,
    textAlign: "center",
  },
  errorButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },

  // Image Gallery Styles
  imageGalleryContainer: {
    backgroundColor: "#fff",
  },
  mainImageContainer: {
    position: "relative",
    height: 300,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  photoCounter: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#F5F5DC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  photoCounterText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  navigationButtons: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  navButton: {
    backgroundColor: "#F5F5DC",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailStrip: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e1e8ed",
  },
  thumbnailContainer: {
    padding: 12,
    gap: 8,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumbnail: {
    borderColor: "#3498db",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },

  // Info Container Styles
  infoContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  statusBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
    lineHeight: 30,
  },
  priceContainer: {
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  priceUnit: {
    fontSize: 20,
    color: "#e74c3c",
  },
  deposit: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 4,
  },

  // Basic Info Styles
  basicInfo: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#2c3e50",
    marginLeft: 12,
    flex: 1,
  },

  // Details Container Styles
  detailsContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
  },
  detailLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    flex: 1,
    textAlign: "right",
  },

  // Description Styles
  descriptionContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#2c3e50",
  },

  // Features Styles
  featuresContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  features: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  // Contact Styles
  contactContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },

  // Contact Info Styles
  contactInfoContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  contactInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  contactInfoText: {
    marginLeft: 16,
    flex: 1,
  },
  contactInfoLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  contactInfoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },

  // Chip Styles
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  chipText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default IlanDetay;
