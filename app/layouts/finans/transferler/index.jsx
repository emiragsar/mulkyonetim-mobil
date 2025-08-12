import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Provider as PaperProvider, Text } from "react-native-paper";
import MDButton from "../../../components/MDButton";

export default function Transferler() {
  return (
    <PaperProvider>
      <ScrollView style={styles.container}>
        <Text variant="headlineSmall" style={styles.sectionTitle}>
          Standard Buttons
        </Text>
        <View style={styles.section}>
          <MDButton onPress={() => console.log("Contained")}>
            Contained Button
          </MDButton>

          <MDButton variant="outlined" color="#2196F3">
            Outlined Button
          </MDButton>

          <MDButton variant="text" color="#4CAF50">
            Text Button
          </MDButton>

          <MDButton variant="elevated" color="#FF9800">
            Elevated Button
          </MDButton>
        </View>

        <Text variant="headlineSmall" style={styles.sectionTitle}>
          FAB Buttons
        </Text>
        <View style={styles.section}>
          <MDButton
            type="fab"
            icon="plus"
            color="#E91E63"
            onPress={() => console.log("FAB pressed")}
          />

          <MDButton type="fab" size="small" icon="edit" color="#9C27B0" />

          <MDButton type="fab" size="large" icon="share" color="#607D8B" />
        </View>

        <Text variant="headlineSmall" style={styles.sectionTitle}>
          Icon Buttons
        </Text>
        <View style={styles.section}>
          <MDButton type="icon" icon="heart" color="#F44336" />

          <MDButton
            type="icon"
            icon="star"
            variant="contained"
            color="#FFC107"
          />

          <MDButton
            type="icon"
            icon="bookmark"
            variant="outlined"
            color="#3F51B5"
          />
        </View>

        <Text variant="headlineSmall" style={styles.sectionTitle}>
          Chip Buttons
        </Text>
        <View style={styles.section}>
          <MDButton
            type="chip"
            icon="filter"
            onPress={() => console.log("Filter chip")}
          >
            Filter
          </MDButton>

          <MDButton type="chip" variant="outlined" icon="sort">
            Sort
          </MDButton>

          <MDButton type="chip" icon="close" compact>
            Remove
          </MDButton>
        </View>

        <Text variant="headlineSmall" style={styles.sectionTitle}>
          Gradient Buttons
        </Text>
        <View style={styles.section}>
          <MDButton
            type="gradient"
            gradientColors={["#667eea", "#764ba2"]}
            onPress={() => console.log("Gradient pressed")}
          >
            Purple Gradient
          </MDButton>

          <MDButton
            type="gradient"
            gradientColors={["#f093fb", "#f5576c"]}
            circular
            icon="heart"
          >
            Pink Gradient
          </MDButton>

          <MDButton
            type="gradient"
            gradientColors={["#4facfe", "#00f2fe"]}
            size="large"
          >
            Blue Gradient
          </MDButton>
        </View>

        <Text variant="headlineSmall" style={styles.sectionTitle}>
          Special States
        </Text>
        <View style={styles.section}>
          <MDButton loading color="#009688">
            Loading Button
          </MDButton>

          <MDButton disabled color="#795548">
            Disabled Button
          </MDButton>

          <MDButton
            icon="download"
            color="#8BC34A"
            rippleColor="rgba(139, 195, 74, 0.3)"
          >
            With Custom Ripple
          </MDButton>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontWeight: "bold",
  },
  section: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
});
