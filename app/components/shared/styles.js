import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  // Cell styles for DataTable
  addressCell: {
    fontSize: 9,
    color: "#333",
    lineHeight: 12,
  },

  statusCell: {
    fontSize: 9,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  priceCell: {
    fontSize: 9,
    color: "#2E7D32",
    textAlign: "center",
    fontWeight: "600",
  },
  tableCell: {
    fontSize: 9,
    color: "#333",
    textAlign: "center",
  },
  tableCellSmall: {
    fontSize: 9,
    color: "#333",
  },
  nameCell: {
    fontSize: 10,
    color: "#333",
    fontWeight: "500",
  },
  skorCell: {
    fontSize: 10,
    color: "#333",
    fontWeight: "600",
  },
  actionButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: "center",
    minWidth: 60,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "500",
  },
  viewButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "500",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "95%",
    maxHeight: "85%",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  detailModalContent: {
    backgroundColor: "white",
    width: "90%",
    maxHeight: "70%",
    borderRadius: 12,
    padding: 20,
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
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
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
  detailContent: {
    maxHeight: 300,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  closeButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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

  // Detail cell styles for modals
  detailCell: {
    fontSize: 10,
    color: "#333",
    textAlign: "center",
  },
  detailAddressCell: {
    fontSize: 10,
    color: "#333",
  },

  // Status-specific styles
  noTenantCell: {
    color: "#e74c3c", // Kırmızı renk - kiracı yok
    textDecorationLine: "none",
  },
  infoText: {
    color: "#3498db",
    fontWeight: "600",
  },
  warningText: {
    color: "#f39c12",
    fontWeight: "600",
  },
  secondaryText: {
    color: "#6c757d",
  },
  successText: {
    color: "#27ae60",
    fontWeight: "600",
  },
  errorText: {
    color: "#e74c3c",
    fontWeight: "600",
  },
  // Additional styles for kontrat page
  infoButton: {
    backgroundColor: "#3498db",
  },
  headerSection: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  blueHeader: {
    backgroundColor: "#3498db",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});

export default commonStyles;
