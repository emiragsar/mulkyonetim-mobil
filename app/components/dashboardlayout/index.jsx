import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import Footer from "../footer";
const DashboardLayout = ({ children }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={styles.safeArea.backgroundColor}
      />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainContent}>{children}</View>
          <Footer />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa", // Genel sayfa arkaplan rengi
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, // Bu, içeriğin az olduğu sayfalarda bile footer'ın en altta kalmasını sağlar
    justifyContent: "space-between", // İçerik ve footer'ı ayırır
  },
});

export default DashboardLayout;
