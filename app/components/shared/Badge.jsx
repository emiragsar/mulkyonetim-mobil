import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Badge = ({ content, color, variant = "gradient" }) => {
  const getBadgeStyle = (colorName) => {
    const colors = {
      success: "#27ae60",
      dark: "#2c3e50",
      error: "#e74c3c",
      info: "#3498db",
    };
    return {
      backgroundColor: colors[colorName] || "#3498db",
    };
  };

  return (
    <View style={[styles.badge, getBadgeStyle(color)]}>
      <Text style={styles.badgeText}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  badgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default Badge; 