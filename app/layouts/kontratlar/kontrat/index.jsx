import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const KiraKontratlari = () => {
  const [selectedRows, setSelectedRows] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allContractsData, setAllContractsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prepareContractsData = () => {
      // Sadece kiracısı olan evleri kontrat olarak göster
      const occupiedProperties = properties.filter(
        (property) => property.tenantId
      );

      const contractsWithDetails = occupiedProperties.map((property) => {
        const owner = getUserById(property.ownerId);
        const tenant = getUserById(property.tenantId);

        // Tamamlanma yüzdesini hesapla (basit bir simülasyon)
        const completion =
          property.status === PROPERTY_STATUS.OCCUPIED
            ? "100%"
            : Math.floor(Math.random() * 30 + 70) + "%";

        return {
          id: property.id,
          property: property.address,
          owner: owner ? owner.fullName : "Bilinmiyor",
          tenant: tenant ? tenant.fullName : "Bilinmiyor",
          completion: completion,
          ownerId: property.ownerId,
          tenantId: property.tenantId,
          price: property.price,
          currency: property.currency,
        };
      });

      setAllContractsData(contractsWithDetails);
      setLoading(false);
    };

    setTimeout(prepareContractsData, 500);
  }, []);

  const getFilteredData = () => {
    if (!searchText.trim()) return allContractsData;

    return allContractsData.filter(
      (item) =>
        item.property.toLowerCase().includes(searchText.toLowerCase()) ||
        item.owner.toLowerCase().includes(searchText.toLowerCase()) ||
        item.tenant.toLowerCase().includes(searchText.toLowerCase()) ||
        item.completion.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const getPaginatedData = () => {
    const filteredData = getFilteredData();
    const startIndex = (currentPage - 1) * selectedRows;
    const endIndex = startIndex + selectedRows;
    return filteredData.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filteredData = getFilteredData();
    return Math.ceil(filteredData.length / selectedRows);
  };

  const handlePageChange = (page) => {
    const totalPages = getTotalPages();
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
    setCurrentPage(1);
  };

  const handleRowsChange = (rows) => {
    setSelectedRows(rows);
    setCurrentPage(1);
  };

  const handleViewDetails = (contractId) => {
    const contract = allContractsData.find((c) => c.id === contractId);
    if (contract) {
      console.log("Kontrat detayları:", {
        property: contract.property,
        owner: contract.owner,
        tenant: contract.tenant,
        completion: contract.completion,
        monthlyRent: `${contract.price} ${contract.currency}`,
      });
    }
  };

  const getCompletionColor = (completion) => {
    const percentage = parseInt(completion);
    if (percentage === 100) return "#e74c3c"; // Kırmızı (tamamlandı)
    if (percentage >= 80) return "#f39c12"; // Turuncu
    return "#3498db"; // Mavi
  };

  const ProgressBar = ({ completion }) => {
    const percentage = parseInt(completion);
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: getCompletionColor(completion),
              },
            ]}
          />
        </View>
        <Text
          style={[
            styles.progressText,
            { color: getCompletionColor(completion) },
          ]}
        >
          {completion}
        </Text>
      </View>
    );
  };

  const TableRow = ({ item, index }) => (
    <View style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
      <Text style={[styles.tableCell, styles.propertyCell]} numberOfLines={2}>
        {item.property}
      </Text>
      <Text style={styles.tableCell}>{item.owner}</Text>
      <Text style={styles.tableCell}>{item.tenant}</Text>
      <View style={[styles.tableCell, styles.progressCell]}>
        <ProgressBar completion={item.completion} />
      </View>
    </View>
  );

  const currentData = getPaginatedData();
  const totalPages = getTotalPages();
  const filteredData = getFilteredData();

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.blueHeader}>
          <Text style={styles.headerTitle}>Kontratlar Tablosu</Text>
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.leftControls}>
            <TouchableOpacity
              style={styles.rowSelector}
              onPress={() => {
                const newRows = selectedRows === 10 ? 5 : 10;
                handleRowsChange(newRows);
              }}
            >
              <Text style={styles.rowSelectorText}>{selectedRows}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
            <Text style={styles.recordsText}>kayıt</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Ara..."
                value={searchText}
                onChangeText={handleSearchChange}
              />
              <Ionicons
                name="search"
                size={16}
                color="#666"
                style={styles.searchIcon}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.propertyHeader]}>DAİRE</Text>
          <Text style={styles.headerCell}>EV SAHİBİ</Text>
          <Text style={styles.headerCell}>KİRACI</Text>
          <Text style={[styles.headerCell, styles.tam]}>TAMAMLANMA</Text>
        </View>
      </View>

      <ScrollView
        style={styles.tableContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
          </View>
        ) : currentData.length > 0 ? (
          currentData.map((item, index) => (
            <TableRow key={item.id} item={item} index={index} />
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              Arama kriterlerinize uygun kayıt bulunamadı.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.paginationContainer}>
        <Text style={styles.paginationText}>
          Toplam {filteredData.length} kaydın{" "}
          {(currentPage - 1) * selectedRows + 1} -{" "}
          {Math.min(currentPage * selectedRows, filteredData.length)} arası
          gösteriliyor.
        </Text>
        <View style={styles.paginationButtons}>
          <TouchableOpacity
            style={[
              styles.pageButton,
              currentPage === 1 && styles.disabledButton,
            ]}
            onPress={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <Ionicons
              name="chevron-back"
              size={16}
              color={currentPage === 1 ? "#ccc" : "#666"}
            />
          </TouchableOpacity>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <TouchableOpacity
              key={page}
              style={[
                styles.pageButton,
                currentPage === page && styles.activePageButton,
              ]}
              onPress={() => handlePageChange(page)}
            >
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === page && styles.activePageButtonText,
                ]}
              >
                {page}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[
              styles.pageButton,
              currentPage === totalPages && styles.disabledButton,
            ]}
            onPress={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <Ionicons
              name="chevron-forward"
              size={16}
              color={currentPage === totalPages ? "#ccc" : "#666"}
            />
          </TouchableOpacity>
        </View>
      </View>

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
    </View>
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
  controlsContainer: {
    padding: 16,
  },
  leftControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  rowSelectorText: {
    fontSize: 14,
    marginRight: 8,
  },
  recordsText: {
    fontSize: 14,
    color: "#666",
    marginRight: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    maxWidth: 200,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  searchIcon: {
    marginLeft: 8,
  },
  tableHeader: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
  },
  headerCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  tam: {
    flex: 1.5,
  },
  propertyHeader: {
    flex: 2,
    textAlign: "left",
  },
  tableContainer: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 16,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  evenRow: {
    backgroundColor: "#f8f9fa",
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  propertyCell: {
    flex: 2,
    textAlign: "left",
  },
  progressCell: {
    flex: 2,
    alignItems: "center",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressBackground: {
    width: "80%",
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  noDataContainer: {
    padding: 40,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  paginationText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  paginationButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: "#f8f9fa",
  },
  activePageButton: {
    backgroundColor: "#3498db",
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
  },
  pageButtonText: {
    fontSize: 14,
    color: "#666",
  },
  activePageButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    alignItems: "center",
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

export default KiraKontratlari;
