// app/index.jsx
import { Redirect } from "expo-router";
import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

const AppEntry = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#09b2e5" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  // Kullanıcı giriş yapmışsa ana uygulamaya, yapmamışsa login'e yönlendir
  return <Redirect href={user ? "/layouts/" : "/authentication/Login"} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});

export default AppEntry;
