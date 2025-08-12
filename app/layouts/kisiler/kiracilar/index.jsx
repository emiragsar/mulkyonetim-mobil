import ErrorView from "@/app/components/shared/ErrorView";
import LoadingView from "@/app/components/shared/LoadingView";
import PageLayout from "@/app/components/shared/PageLayout";
import { commonStyles } from "@/app/components/shared/styles";
import DataTable from "@/app/components/tables";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchTenantDetails, useKiracilarData } from "./data.js";

const Kiracilar = () => {
  const { allTenantsData, loading, error, fetchKiracilar } = useKiracilarData();

  // Modal states
  const [selectedTenantName, setSelectedTenantName] = useState(null);
  const [tenantDetails, setTenantDetails] = useState([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const handleViewDetails = async (tenantId, tenantName) => {
    try {
      setDetailsLoading(true);
      setSelectedTenantName(tenantName);
      setDetailsModalVisible(true);

      const details = await fetchTenantDetails(tenantId, tenantName);
      setTenantDetails(details);
    } catch (err) {
      // Error is already handled in fetchTenantDetails
      setTenantDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  // DataTable için kolonları tanımlıyoruz
  const columns = [
    {
      Header: "AD-SOYAD",
      accessor: "name",
      flex: 2.5,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.nameCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "TELEFON",
      accessor: "phone",
      flex: 2,
      align: "center",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCell} numberOfLines={1}>
          {value}
        </Text>
      ),
    },
    {
      Header: "MAİL",
      accessor: "email",
      flex: 2.5,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.tableCellSmall} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "ADRES",
      accessor: "address",
      flex: 3,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.addressCell} numberOfLines={3}>
          {value}
        </Text>
      ),
    },
    {
      Header: "SKOR",
      accessor: "skor",
      flex: 1,
      align: "center",
      Cell: ({ value }) => (
        <Text style={commonStyles.skorCell} numberOfLines={1}>
          {value}
        </Text>
      ),
    },
    {
      Header: "GÜNCEL KONTRAT",
      accessor: "id",
      flex: 1.5,
      align: "center",
      Cell: ({ value, row }) => (
        <TouchableOpacity
          style={commonStyles.viewButton}
          onPress={() => handleViewDetails(value, row.original.name)}
        >
          <Text style={commonStyles.viewButtonText}>Görüntüle</Text>
        </TouchableOpacity>
      ),
    },
  ];

  // Details modal için kolonlar
  const detailColumns = [
    {
      Header: "KİRALIK EV ADRESİ",
      accessor: "kiralikEv",
      flex: 3,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.detailAddressCell} numberOfLines={4}>
          {value}
        </Text>
      ),
    },
    {
      Header: "EV SAHİBİ",
      accessor: "evSahibi",
      flex: 2,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.detailCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "KİRA BEDELİ",
      accessor: "kiraBedeli",
      flex: 1.5,
      align: "right",
      Cell: ({ value }) => (
        <Text style={commonStyles.detailCell} numberOfLines={1}>
          {value}
        </Text>
      ),
    },
    {
      Header: "BAŞLANGIÇ",
      accessor: "sozlesmeBaslangic",
      flex: 1.5,
      align: "center",
      Cell: ({ value }) => (
        <Text style={commonStyles.detailCell} numberOfLines={1}>
          {value}
        </Text>
      ),
    },
  ];

  // DataTable için veri yapısını hazırlıyoruz
  const tableData = {
    columns,
    rows: allTenantsData,
  };

  const detailTableData = {
    columns: detailColumns,
    rows: tenantDetails,
  };

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={fetchKiracilar} />;
  }

  return (
    <PageLayout
      title="Kiracılar"
      tableData={tableData}
      onRefresh={fetchKiracilar}
    >
      {/* Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalContent}>
            <View style={commonStyles.modalHeader}>
              <Text style={commonStyles.modalTitle}>
                {selectedTenantName} - Kontrat Listesi
              </Text>
              <TouchableOpacity
                onPress={() => setDetailsModalVisible(false)}
                style={commonStyles.modalCloseButton}
              >
                <Text style={commonStyles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {detailsLoading ? (
              <View style={commonStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={commonStyles.loadingText}>
                  Kontrat bilgileri yükleniyor...
                </Text>
              </View>
            ) : tenantDetails.length > 0 ? (
              <DataTable
                table={detailTableData}
                entriesPerPage={{
                  defaultValue: 10,
                  entries: [5, 10, 15, 20],
                }}
                canSearch={false}
                showTotalEntries={true}
                isSorted={false}
                noEndBorder={false}
              />
            ) : (
              <View style={commonStyles.noDataContainer}>
                <Text style={commonStyles.noDataText}>
                  Bu kiracıya ait güncel kontrat bulunamadı.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </PageLayout>
  );
};

export default Kiracilar;
