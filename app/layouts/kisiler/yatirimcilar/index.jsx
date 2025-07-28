import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Yatirimcilar = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yatırımcılar</Text>
      <Text style={styles.subtitle}>
        Bu sayfa henüz geliştirilme aşamasındadır.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
});

export default Yatirimcilar;
