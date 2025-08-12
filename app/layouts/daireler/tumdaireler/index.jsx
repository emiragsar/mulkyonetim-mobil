import ImageGalleryModal from "@/app/components/shared/ImageGalleryModal.jsx";
import LoadingView from "@/app/components/shared/LoadingView.jsx";
import PageLayout from "@/app/components/shared/PageLayout.jsx";
import commonStyles from "@/app/components/shared/styles.js";
import DataTable from "@/app/components/tables";
import React, { useState } from "react";
import ErrorView from "@/app/components/shared/ErrorView.jsx";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  handleViewDocuments,
  handleViewOldTenants,
  handleViewPhotos,
  useTumDairelerData,
} from "./data.js";
const DaireTable = () => {
  const { allDaireData, loading, error, fetchDaireler, fetchAllUsers } =
    useTumDairelerData();

  // Modal states
  const [imageGalleryItems, setImageGalleryItems] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [oldTenants, setOldTenants] = useState([]);
  const [selectedDaireId, setSelectedDaireId] = useState(null);
  const [oldTenantsModalVisible, setOldTenantsModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState("");
  const [detailModalTitle, setDetailModalTitle] = useState("");

  const handleShowDetail = (detail, title) => {
    setSelectedDetail(detail);
    setDetailModalTitle(title);
    setDetailModalVisible(true);
  };

  // DataTable için kolonları tanımlıyoruz
  const columns = [
    {
      Header: "ADRES",
      accessor: "adres",
      flex: 4,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.addressCell} numberOfLines={4}>
          {value}
        </Text>
      ),
    },
    {
      Header: "EV SAHİBİ",
      accessor: "ev_sahibi",
      flex: 2,
      align: "left",
      Cell: ({ value, row }) => (
        <TouchableOpacity
          onPress={() =>
            handleShowDetail(
              row.original.ev_sahibi_detail,
              "Ev Sahibi Bilgileri"
            )
          }
        >
          <Text style={commonStyles.clickableCell} numberOfLines={2}>
            {value}
          </Text>
        </TouchableOpacity>
      ),
    },
    {
      Header: "KİRACI",
      accessor: "kiraci",
      flex: 2,
      align: "left",
      Cell: ({ value, row }) => (
        <TouchableOpacity
          onPress={() =>
            handleShowDetail(row.original.kiraci_detail, "Kiracı Bilgileri")
          }
        >
          <Text style={commonStyles.clickableCell} numberOfLines={2}>
            {value}
          </Text>
        </TouchableOpacity>
      ),
    },
    {
      Header: "DURUM",
      accessor: "durum",
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={commonStyles.statusCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "ÜCRET",
      accessor: "istenen_ucret",
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={commonStyles.priceCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "FOTOĞRAF",
      accessor: "id",
      flex: 1.2,
      align: "center",
      Cell: ({ value }) => (
        <TouchableOpacity
          style={commonStyles.actionButton}
          onPress={() =>
            handleViewPhotos(
              value,
              setImageGalleryItems,
              setCurrentImageIndex,
              setShowGallery
            )
          }
        >
          <Text style={commonStyles.actionButtonText}>Görüntüle</Text>
        </TouchableOpacity>
      ),
    },
    {
      Header: "BELGE",
      accessor: "id",
      flex: 1.2,
      align: "center",
      Cell: ({ value }) => (
        <TouchableOpacity
          style={commonStyles.actionButton}
          onPress={() =>
            handleViewDocuments(
              value,
              setImageGalleryItems,
              setCurrentImageIndex,
              setShowGallery
            )
          }
        >
          <Text style={commonStyles.actionButtonText}>Görüntüle</Text>
        </TouchableOpacity>
      ),
    },
    {
      Header: "ESKİ KİRACI",
      accessor: "id",
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <TouchableOpacity
          style={commonStyles.actionButton}
          onPress={() =>
            handleViewOldTenants(
              value,
              fetchAllUsers,
              setOldTenants,
              setSelectedDaireId,
              setOldTenantsModalVisible
            )
          }
        >
          <Text style={commonStyles.actionButtonText}>Görüntüle</Text>
        </TouchableOpacity>
      ),
    },
  ];

  // Old tenants table columns
  const oldTenantsColumns = [
    {
      Header: "KİRACI ADI",
      accessor: "adSoyad",
      flex: 2,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "DÖNEM",
      accessor: "donem",
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "AYLIK BEDEL",
      accessor: "aylikBedel",
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={1}>
          {value}
        </Text>
      ),
    },
    {
      Header: "TOPLAM ÖDEME",
      accessor: "toplamOdeme",
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={1}>
          {value}
        </Text>
      ),
    },
    {
      Header: "GECİKEN ÖDEME",
      accessor: "gecikenOdeme",
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={1}>
          {value}
        </Text>
      ),
    },
    {
      Header: "DEPOZİTO",
      accessor: "depozito",
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={1}>
          {value}
        </Text>
      ),
    },
  ];

  // DataTable için veri yapısını hazırlıyoruz
  const tableData = {
    columns,
    rows: allDaireData,
  };

  const oldTenantsTableData = {
    columns: oldTenantsColumns,
    rows: oldTenants,
  };

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={fetchDaireler} />;
  }

  return (
    <PageLayout
      title="Daire Bilgileri"
      tableData={tableData}
      onRefresh={fetchDaireler}
    >
      {/* Image Gallery Modal */}
      <ImageGalleryModal
        visible={showGallery}
        images={imageGalleryItems}
        currentIndex={currentImageIndex}
        setCurrentIndex={setCurrentImageIndex}
        onClose={() => setShowGallery(false)}
      />

      {/* Old Tenants Modal */}
      <Modal
        visible={oldTenantsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOldTenantsModalVisible(false)}
      >
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalContent}>
            <View style={commonStyles.modalHeader}>
              <Text style={commonStyles.modalTitle}>Eski Kiracılar</Text>
              <TouchableOpacity
                onPress={() => setOldTenantsModalVisible(false)}
                style={commonStyles.modalCloseButton}
              >
                <Text style={commonStyles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <DataTable
              table={oldTenantsTableData}
              entriesPerPage={{
                defaultValue: 5,
                entries: [5, 10, 15],
              }}
              canSearch={false}
              showTotalEntries={true}
              isSorted={false}
              noEndBorder={false}
            />
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.detailModalContent}>
            <View style={commonStyles.modalHeader}>
              <Text style={commonStyles.modalTitle}>{detailModalTitle}</Text>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={commonStyles.modalCloseButton}
              >
                <Text style={commonStyles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={commonStyles.detailContent}>
              <Text style={commonStyles.detailText}>{selectedDetail}</Text>
            </ScrollView>

            <TouchableOpacity
              style={commonStyles.closeButton}
              onPress={() => setDetailModalVisible(false)}
            >
              <Text style={commonStyles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </PageLayout>
  );
};

// Styles are now in shared/styles.js

export default DaireTable;
