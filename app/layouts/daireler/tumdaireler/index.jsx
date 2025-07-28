import axios from "axios"; // axios'u import ediyoruz
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, // Modal'ı import ediyoruz
  Button, // Kapat butonu için
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Yapısal ve konfigürasyonel importlar
import API_BASE_URL from "../../../../config/api"; // API konfigürasyonumuzu import ediyoruz
import DashboardLayout from "../../../components/dashboardlayout";
import DataTableCard from "../../../components/datatablecard";

// Bu sayfaya özel, küçük yardımcı bileşenler
const TableRow = ({
  item,
  index,
  onViewPhotos,
  onViewDocuments,
  onViewOldTenants,
}) => (
  <View style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
    <Text style={[styles.tableCell, styles.addressCell]} numberOfLines={3}>
      {item.adres}
    </Text>
    <Text style={styles.tableCell}>{item.ev_sahibi}</Text>
    <Text style={styles.tableCell}>{item.kiraci}</Text>
    <Text style={styles.tableCell}>{item.durum}</Text>
    <Text style={styles.tableCell}>{item.istenen_ucret}</Text>
    <View style={styles.actionCell}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onViewPhotos(item.id)}
      >
        <Text style={styles.actionButtonText}>Foto</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onViewDocuments(item.id)}
      >
        <Text style={styles.actionButtonText}>Belge</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onViewOldTenants(item.id)}
      >
        <Text style={styles.actionButtonText}>Geçmiş</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const TumDaireler = () => {
  // --- STATE'LER ---
  const [loading, setLoading] = useState(true);
  const [daireData, setDaireData] = useState([]);
  const [error, setError] = useState(null);

  // Modal'lar için state'ler
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [isOldTenantsVisible, setIsOldTenantsVisible] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);
  const [oldTenants, setOldTenants] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  // --- VERİ ÇEKME VE İŞLEME MANTIĞI ---
  // (useDaireTableData hook'undan uyarlanmıştır)

  // Tüm kullanıcıları tek seferde çeken ve bir haritaya dönüştüren fonksiyon
  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      // Kullanıcıları ID'lerine göre bir obje içinde sakla (hızlı erişim için)
      return response.data.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
    } catch (err) {
      console.error("Kullanıcılar çekilirken hata oluştu:", err);
      return {}; // Hata durumunda boş obje dön
    }
  }, []);

  // Ana veri çekme işlemi
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Daireleri ve kullanıcıları paralel olarak çek
        const [daireRes, userMap] = await Promise.all([
          axios.get(`${API_BASE_URL}/daire`),
          fetchAllUsers(),
        ]);

        // Gelen daire verisini zenginleştir (kullanıcı isimleri vb. ekle)
        const enrichedRows = daireRes.data.map((item) => {
          const evSahibi = userMap[item.Ev_Sahibi_ID];
          const kiraci = item.Guncel_Kiraci_ID
            ? userMap[item.Guncel_Kiraci_ID]
            : null;

          return {
            id: item.Daire_ID,
            adres: `${item.Mahalle || ""} ${item.Sokak || ""} No:${
              item.Apartman_No || ""
            } D:${item.Daire_No || ""} ${item.Ilce || ""}/${
              item.Il || ""
            }`.trim(),
            ev_sahibi: evSahibi
              ? `${evSahibi.Ad} ${evSahibi.Soyad}`
              : "Bilinmiyor",
            kiraci: kiraci ? `${kiraci.Ad} ${kiraci.Soyad}` : "-",
            durum: item.Kiralik ? "Kiralık" : item.Satilik ? "Satılık" : "Dolu",
            istenen_ucret: item.Kiralik
              ? `${item.Istenen_Kira} TL`
              : item.Satilik
              ? `${item.Istenen_Satis_Bedeli} TL`
              : "-",
          };
        });

        setDaireData(enrichedRows);
      } catch (err) {
        setError("Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
        console.error("Daire verisi çekilirken hata:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchAllUsers]);

  // --- ETKİLEŞİM FONKSİYONLARI ---

  const handleViewPhotos = async (daireId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/daire_fotograf?Daire_ID=${daireId}`
      );
      const items = res.data.map((p) => ({
        uri: p.Url,
        description: p.Fotograf_Aciklama,
      }));
      setGalleryItems(items);
      setModalTitle("Daire Fotoğrafları");
      setIsGalleryVisible(true);
    } catch (err) {
      console.error("Fotoğraflar çekilirken hata:", err);
    }
  };

  const handleViewDocuments = async (daireId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/daire_belge?Daire_ID=${daireId}`
      );
      // Belgeler genelde PDF olabilir, açmak için farklı bir mantık gerekebilir.
      // Şimdilik fotoğraf gibi gösteriyoruz.
      const items = res.data.map((b) => ({
        uri: b.Url,
        description: b.Belge_Aciklama,
      }));
      setGalleryItems(items);
      setModalTitle("Daire Belgeleri");
      setIsGalleryVisible(true);
    } catch (err) {
      console.error("Belgeler çekilirken hata:", err);
    }
  };

  const handleViewOldTenants = async (daireId) => {
    try {
      const [res, userMap] = await Promise.all([
        axios.get(`${API_BASE_URL}/kontrat?Daire_ID=${daireId}`),
        fetchAllUsers(),
      ]);
      const filtered = res.data.filter(
        (item) => item.Sozlesme_Durumu_Aktif === false
      );
      const tenants = filtered.map((item) => {
        const user = userMap[item.Kiraci_ID];
        return {
          name: user ? `${user.Ad} ${user.Soyad}` : "Bilinmiyor",
          period: `${item.Sozlesme_Baslangic_Tarihi} - ${item.Sozlesme_Bitis_Tarihi}`,
        };
      });
      setOldTenants(tenants);
      setIsOldTenantsVisible(true);
    } catch (err) {
      console.error("Eski kiracılar çekilirken hata:", err);
    }
  };

  // --- RENDER BÖLÜMÜ ---

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          style={{ marginTop: 50 }}
          size="large"
          color="#3498db"
        />
      );
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (daireData.length === 0) {
      return (
        <Text style={styles.noDataText}>Gösterilecek daire bulunamadı.</Text>
      );
    }
    return daireData.map((item, index) => (
      <TableRow
        key={item.id}
        item={item}
        index={index}
        onViewPhotos={handleViewPhotos}
        onViewDocuments={handleViewDocuments}
        onViewOldTenants={handleViewOldTenants}
      />
    ));
  };

  return (
    <DashboardLayout>
      <DataTableCard title="Tüm Daireler">
        {/* TODO: Arama ve filtreleme kontrolleri buraya eklenebilir */}

        {/* Tablo Başlığı */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.addressCell]}>ADRES</Text>
          <Text style={styles.headerCell}>EV SAHİBİ</Text>
          <Text style={styles.headerCell}>KİRACI</Text>
          <Text style={styles.headerCell}>DURUM</Text>
          <Text style={styles.headerCell}>ÜCRET</Text>
          <Text style={[styles.headerCell, styles.actionCell]}>İŞLEMLER</Text>
        </View>

        {/* Tablo İçeriği (ScrollView içinde) */}
        <ScrollView style={styles.tableScrollView}>
          {renderContent()}
        </ScrollView>
      </DataTableCard>

      {/* Fotoğraf/Belge Görüntüleme Modalı */}
      <Modal
        visible={isGalleryVisible}
        animationType="slide"
        onRequestClose={() => setIsGalleryVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{modalTitle}</Text>
          <ScrollView>
            {galleryItems.map((item, index) => (
              <View key={index} style={styles.galleryItem}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.galleryImage}
                  resizeMode="contain"
                />
                <Text>{item.description}</Text>
              </View>
            ))}
          </ScrollView>
          <Button title="Kapat" onPress={() => setIsGalleryVisible(false)} />
        </View>
      </Modal>

      {/* Eski Kiracılar Modalı */}
      <Modal
        visible={isOldTenantsVisible}
        animationType="slide"
        onRequestClose={() => setIsOldTenantsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Geçmiş Kiracılar</Text>
          <ScrollView>
            {oldTenants.map((tenant, index) => (
              <View key={index} style={styles.tenantItem}>
                <Text style={styles.tenantName}>{tenant.name}</Text>
                <Text>Dönem: {tenant.period}</Text>
              </View>
            ))}
          </ScrollView>
          <Button title="Kapat" onPress={() => setIsOldTenantsVisible(false)} />
        </View>
      </Modal>
    </DashboardLayout>
  );
};

// --- STYLESHEET ---
const styles = StyleSheet.create({
  // ... (DataTableCard, DashboardLayout stilleri dışındaki tüm stiller)
  tableScrollView: { maxHeight: 600 }, // Uzun listeler için scroll
  tableHeader: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  headerCell: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 10,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  evenRow: { backgroundColor: "#f9f9f9" },
  tableCell: { flex: 1, fontSize: 12, textAlign: "center" },
  addressCell: { flex: 2, textAlign: "left" },
  actionCell: {
    flex: 1.5,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    backgroundColor: "#3498db",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  actionButtonText: { color: "white", fontSize: 10 },
  errorText: { color: "red", textAlign: "center", margin: 20 },
  noDataText: { color: "#666", textAlign: "center", margin: 20 },
  // Modal Stilleri
  modalContainer: { flex: 1, paddingTop: 50, padding: 20 },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  galleryItem: { marginBottom: 20, alignItems: "center" },
  galleryImage: { width: "100%", height: 200, marginBottom: 10 },
  tenantItem: { padding: 10, borderBottomWidth: 1, borderColor: "#ccc" },
  tenantName: { fontWeight: "bold" },
});

export default TumDaireler;
