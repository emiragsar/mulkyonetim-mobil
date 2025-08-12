import Badge from "@/app/components/shared/Badge";
import ErrorView from "@/app/components/shared/ErrorView";
import LoadingView from "@/app/components/shared/LoadingView";
import PageLayout from "@/app/components/shared/PageLayout";
import Progress from "@/app/components/shared/Progress";
import { commonStyles } from "@/app/components/shared/styles";
import DataTable from "@/app/components/tables";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useKontratData } from "./data.js";

const KontratTable = () => {
  const {
    rows,
    selectedKontrat,
    details,
    loading,
    error,
    handleRowClick,
    refetch,
  } = useKontratData();

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState("");

  const handleShowDetail = (detail) => {
    setSelectedDetail(detail);
    setDetailModalVisible(true);
  };

  // Main table columns
  const columns = [
    {
      Header: "DAİRE",
      accessor: "daire",
      flex: 3,
      align: "left",
      Cell: ({ value, row }) => (
        <TouchableOpacity onPress={() => handleShowDetail(row.original.detail)}>
          <Text
            style={[commonStyles.addressCell, commonStyles.clickableCell]}
            numberOfLines={3}
          >
            {value}
          </Text>
        </TouchableOpacity>
      ),
    },
    {
      Header: "EV SAHİBİ",
      accessor: "ev_sahibi",
      flex: 2,
      align: "left",
      Cell: ({ value, row }) => (
        <TouchableOpacity onPress={() => handleShowDetail(row.original.detail)}>
          <Text
            style={[commonStyles.tableCell, commonStyles.clickableCell]}
            numberOfLines={2}
          >
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
        <TouchableOpacity onPress={() => handleShowDetail(row.original.detail)}>
          <Text
            style={[commonStyles.tableCell, commonStyles.clickableCell]}
            numberOfLines={2}
          >
            {value}
          </Text>
        </TouchableOpacity>
      ),
    },
    {
      Header: "TAMAMLANMA",
      accessor: "tamamlanma",
      flex: 2,
      align: "center",
      Cell: ({ value, row }) => (
        <TouchableOpacity onPress={() => handleShowDetail(row.original.detail)}>
          <Progress color={row.original.progressColor} value={value} />
        </TouchableOpacity>
      ),
    },
    {
      Header: "DURUM",
      accessor: "durum",
      flex: 1.5,
      align: "center",
      Cell: ({ value, row }) => (
        <TouchableOpacity onPress={() => handleShowDetail(row.original.detail)}>
          <Badge
            content={value == 1 ? "Aktif" : "Tamamlandı"}
            color={value == 1 ? "success" : "dark"}
          />
        </TouchableOpacity>
      ),
    },
    {
      Header: "TRANSFERLER",
      accessor: "transferler",
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <TouchableOpacity
          style={[commonStyles.actionButton, commonStyles.infoButton]}
          onPress={() => handleRowClick(value)}
        >
          <Text style={commonStyles.actionButtonText}>Görüntüle</Text>
        </TouchableOpacity>
      ),
    },
  ];

  // Transfer table columns
  const detailColumns = [
    {
      Header: "GÖNDEREN",
      accessor: "gonderen",
      flex: 2,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "ALICI",
      accessor: "alici",
      flex: 2,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "TUTAR",
      accessor: "transfer_toplam",
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={[commonStyles.tableCell, commonStyles.priceCell]} numberOfLines={1}>
          {value}
        </Text>
      ),
    },
    {
      Header: "TARİH",
      accessor: "transfer_tarihi",
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={1}>
          {value}
        </Text>
      ),
    },
    {
      Header: "AÇIKLAMA",
      accessor: "transfer_aciklama",
      flex: 2,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
  ];

  // DataTable için veri yapısını hazırlıyoruz
  const tableData = {
    columns,
    rows,
  };

  const detailTableData = {
    columns: detailColumns,
    rows: details,
  };

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={refetch} />;
  }

  return (
    <PageLayout
      title="Kontratlar Tablosu"
      tableData={tableData}
      onRefresh={refetch}
      tableProps={{
        // Default sorting: tamamlanma kolonuna göre yüksekten düşüğe
        initialState: {
          sortBy: [{ id: "tamamlanma", desc: true }],
        },
      }}
    >
      {/* Transfer Records Section */}
      {selectedKontrat && details.length > 0 && (
        <View style={commonStyles.headerSection}>
          <View style={commonStyles.blueHeader}>
            <View style={commonStyles.headerContent}>
              <Text style={commonStyles.headerTitle}>Kontrata Ait Transferler</Text>
              <TouchableOpacity
                style={commonStyles.refreshButton}
                onPress={() => {
                  // Reset details and selected kontrat
                  // This will be handled by the hook
                }}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <DataTable
            table={detailTableData}
            entriesPerPage={{
              defaultValue: 10,
              entries: [5, 10, 25, 50],
            }}
            canSearch={true}
            showTotalEntries={true}
            isSorted={true}
            noEndBorder={false}
            pagination={{
              variant: "gradient",
              color: "info",
            }}
          />
        </View>
      )}

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
              <Text style={commonStyles.modalTitle}>Kontrat Detayları</Text>
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

export default KontratTable;
