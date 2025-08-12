import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ImageGalleryModal = ({
  visible,
  images,
  currentIndex,
  setCurrentIndex,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.galleryOverlay}>
        <View style={styles.galleryContainer}>
          <View style={styles.galleryHeader}>
            <Text style={styles.galleryTitle}>
              {currentIndex + 1} / {images.length}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.galleryCloseButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / screenWidth
              );
              setCurrentIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.galleryImage}
                  resizeMode="contain"
                />
                {item.description ? (
                  <View style={styles.imageDescriptionContainer}>
                    <Text style={styles.imageDescription}>
                      {item.description}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />

          <View style={styles.galleryNavigation}>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentIndex === 0 && styles.disabledNavButton,
              ]}
              onPress={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(currentIndex - 1);
                }
              }}
              disabled={currentIndex === 0}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                currentIndex === images.length - 1 && styles.disabledNavButton,
              ]}
              onPress={() => {
                if (currentIndex < images.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                }
              }}
              disabled={currentIndex === images.length - 1}
            >
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  galleryOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  galleryContainer: {
    flex: 1,
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  galleryTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  galleryCloseButton: {
    padding: 10,
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight - 200,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryImage: {
    width: screenWidth - 40,
    height: screenHeight - 300,
  },
  imageDescriptionContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 8,
  },
  imageDescription: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  galleryNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  navButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledNavButton: {
    opacity: 0.3,
  },
});

export default ImageGalleryModal;
