import DashboardLayout from "@/app/components/dashboardlayout";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const LoadingView = ({ message = "Veriler yükleniyor..." }) => {
  return (
    <DashboardLayout>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
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

export default LoadingView;
