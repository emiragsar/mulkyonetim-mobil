import React from "react";
import { StyleSheet, Text, View } from "react-native";

const DataTableCard = ({ title, children }) => {
  return (
    <View style={styles.card}>
      {/* Mavi Başlık Alanı (React'taki MDBox gibi) */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>

      {/* Kartın İçeriği (DataTable, kontroller vb. buraya gelecek) */}
      <View style={styles.cardContent}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3, // Android için gölge
    shadowColor: "#000", // iOS için gölge
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16, // Diğer kartlarla arasında boşluk
  },
  cardHeader: {
    backgroundColor: "#3498db", // Mavi başlık
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardContent: {
    // İçerik için ekstra stil gerekirse buraya eklenebilir.
    // Örneğin padding: 16
  },
});

export default DataTableCard;
