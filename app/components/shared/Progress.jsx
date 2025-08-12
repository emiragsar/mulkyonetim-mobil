import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Progress = ({ color, value }) => {
  const getProgressColor = (progressValue) => {
    if (progressValue > 80) return "#e74c3c"; // Kırmızı
    if (progressValue > 50) return "#3498db"; // Mavi
    return "#27ae60"; // Yeşil
  };

  const progressColor = getProgressColor(value);

  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>{value}%</Text>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${value}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  progressText: {
    fontSize: 10,
    color: "#333",
    marginRight: 6,
    minWidth: 28,
    textAlign: "right",
    fontWeight: "600",
  },
  progressBarContainer: {
    flex: 1,
    maxWidth: 70,
    minWidth: 50,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: "#e9ecef",
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
    minWidth: 2, // Minimum genişlik için
  },
});

export default Progress; 