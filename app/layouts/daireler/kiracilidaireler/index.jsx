import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function KiraciliDaireler() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kiracılı Daireler</Text>
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
