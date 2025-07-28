import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function TeknikTakip() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teknik Takip</Text>
      <Text style={styles.subtitle}>Bu sayfa geliştirilme aşamasında...</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
