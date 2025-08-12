import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

// React Native component equivalents
import { Card } from "react-native-paper";

// Custom components (bunları da oluşturmanız gerekecek)
import DashboardLayout from "../dashboardlayout";
import DataTable from "../tables";

const Tables = () => {
  const { columns, rows } = authorsTableData();
  const { columns: pColumns, rows: pRows } = projectsTableData();

  return (
    <SafeAreaView style={styles.container}>
      <DashboardLayout>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.gridContainer}>
            {/* Authors Table Card */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Authors Table</Text>
              </View>
              <View style={styles.cardContent}>
                <DataTable
                  data={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </View>
            </Card>

            {/* Projects Table Card */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Projects Table</Text>
              </View>
              <View style={styles.cardContent}>
                <DataTable
                  data={{ columns: pColumns, rows: pRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </View>
            </Card>
          </View>
        </ScrollView>
      </DashboardLayout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 12,
  },
  gridContainer: {
    paddingHorizontal: 16,
    gap: 24,
  },
  card: {
    marginBottom: 24,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    backgroundColor: "#1976d2", // info color
    marginHorizontal: 8,
    marginTop: -12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: "#1976d2",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  cardContent: {
    paddingTop: 12,
  },
});

export default Tables;
