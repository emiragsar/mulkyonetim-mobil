import DashboardLayout from "@/app/components/dashboardlayout";
import DataTable from "@/app/components/tables";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PageLayout = ({
  title,
  tableData,
  children,
  onRefresh,
  showRefreshButton = true,
  headerBackgroundColor = "#3498db",
  tableProps = {},
}) => {
  return (
    <DashboardLayout>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View
            style={[
              styles.blueHeader,
              { backgroundColor: headerBackgroundColor },
            ]}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{title}</Text>
              {showRefreshButton && onRefresh && (
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={onRefresh}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* DataTable */}
          {tableData && (
            <DataTable
              table={tableData}
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
              {...tableProps}
            />
          )}
        </View>

        {/* Additional content */}
        {children}
      </View>
    </DashboardLayout>
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
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  blueHeader: {
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
});

export default PageLayout;
