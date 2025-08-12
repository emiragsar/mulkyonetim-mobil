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
import { fetchOwnerDetails, useEvSahipleriData } from "./data.js";

const EvSahipleri = () => {
  const { allOwnersData, loading, error, fetchEvSahipleri } = useEvSahipleriData();

  // Modal states
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerDetails, setOwnerDetails] = useState([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const handleViewDetails = async (ownerId, ownerName) => {
    try {
      setDetailsLoading(true);
      setSelectedOwner(ownerName);

      const details = await fetchOwnerDetails(ownerId, ownerName);
      setOwnerDetails(details);
      setDetailsModalVisible(true);
    } catch (err) {
      // Error is already handled in fetchOwnerDetails
    } finally {
      setDetailsLoading(false);
    }
  };

  // DataTable için kolonları tanımlıyoruz
  const columns = [
    {
      Header: "AD-SOYAD",
      accessor: "name",
      width: 120,
      align: "left",
      Cell: ({ value }) => <Text style={commonStyles.nameCell}>{value}</Text>,
    },
    {
      Header: "TELEFON",
      accessor: "phone",
      width: 100,
      Cell: ({ value }) => <Text style={commonStyles.tableCell}>{value}</Text>,
    },
    {
      Header: "MAİL",
      accessor: "email",
      width: 120,
      Cell: ({ value }) => <Text style={commonStyles.tableCell}>{value}</Text>,
    },
    {
      Header: "ADRES",
      accessor: "address",
      width: 150,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.addressCell} numberOfLines={2}>
          {value}
        </Text>
      ),
    },
    {
      Header: "DAİRELER",
      accessor: "id",
      width: 80,
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
      Header: "ADRES",
      accessor: "address",
      width: 200,
      align: "left",
      Cell: ({ value }) => (
        <Text style={commonStyles.detailAddressCell} numberOfLines={3}>
          {value}
        </Text>
      ),
    },
    {
      Header: "DURUM",
      accessor: "status",
      width: 100,
      Cell: ({ value }) => <Text style={commonStyles.detailCell}>{value}</Text>,
    },
    {
      Header: "ÜCRET",
      accessor: "price",
      width: 100,
      Cell: ({ value }) => <Text style={commonStyles.detailCell}>{value}</Text>,
    },
    {
      Header: "KİRACI",
      accessor: "tenantName",
      width: 100,
      Cell: ({ value }) => <Text style={commonStyles.detailCell}>{value}</Text>,
    },
  ];

  // DataTable için veri yapısını hazırlıyoruz
  const tableData = {
    columns,
    rows: allOwnersData,
  };

  const detailTableData = {
    columns: detailColumns,
    rows: ownerDetails,
  };

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={fetchEvSahipleri} />;
  }

  return (
    <PageLayout
      title="Ev Sahipleri"
      tableData={tableData}
      onRefresh={fetchEvSahipleri}
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
                {selectedOwner} - Daire Listesi
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
                  Daire bilgileri yükleniyor...
                </Text>
              </View>
            ) : ownerDetails.length > 0 ? (
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
                  Bu ev sahibine ait daire bulunamadı.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </PageLayout>
  );
};

export default EvSahipleri;
