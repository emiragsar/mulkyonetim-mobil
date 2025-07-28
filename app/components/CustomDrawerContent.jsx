import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const menuItems = [
  {
    title: "Özet",
    icon: "grid-outline",
    route: "/layouts/",
    isExpanded: false,
    type: "normal",
  },
  {
    title: "Kişiler",
    icon: "people-outline",
    isExpanded: false,
    type: "expandable",
    children: [
      {
        title: "Kişi Ekle",
        route: "/layouts/kisiler/kisi_ekle/",
      },
      {
        title: "Ev Sahipleri",
        route: "/layouts/kisiler/evsahipleri/",
      },
      {
        title: "Kiracılar",
        route: "/layouts/kisiler/kiracilar/",
      },
      {
        title: "Ustalar",
        route: "/layouts/kisiler/ustalar/",
      },
      {
        title: "Yatırımcılar",
        route: "/layouts/kisiler/yatirimcilar/",
      },
    ],
  },
  {
    title: "Daireler",
    icon: "home-outline",
    isExpanded: false,
    type: "expandable",
    children: [
      {
        title: "Daire Ekle",
        route: "/layouts/daireler/daire_ekle/",
      },
      {
        title: "Tüm Daireler",
        route: "/layouts/daireler/tumdaireler/",
      },
      {
        title: "Kiracılı Daireler",
        route: "/layouts/daireler/kiracilidaireler/",
      },
      {
        title: "Boş Daireler",
        route: "/layouts/daireler/bosdaireler/",
      },
      {
        title: "Tahliye Edilecekler",
        route: "/layouts/daireler/tahliye_edilecekler/",
      },
      {
        title: "Teknik Takip",
        route: "/layouts/daireler/teknik_takip/",
      },
    ],
  },
  {
    title: "Kontratlar",
    icon: "document-text-outline",
    isExpanded: false,
    type: "expandable",
    children: [
      {
        title: "Kira Kontratları",
        route: "/layouts/kontratlar/kontrat/",
      },
      {
        title: "Kontrat Yönetim",
        route: "/layouts/kontratlar/kontrat_yonetim/",
      },
    ],
  },
  {
    title: "Finans",
    icon: "trending-up-outline",
    isExpanded: false,
    type: "expandable",
    children: [
      {
        title: "Transferler",
        route: "/layouts/finans/transferler/",
      },
      {
        title: "Kişi Bazlı Gelir/Gider",
        route: "/layouts/finans/kisibasigelirgider/",
      },
      {
        title: "Dönemsel Finansal Özet",
        route: "/layouts/finans/donemselfinansal/",
      },
    ],
  },
  {
    title: "Arızalar",
    icon: "warning-outline",
    isExpanded: false,
    type: "expandable",
    children: [
      {
        title: "Arıza Ekle",
        route: "/layouts/arizalar/ariza_ekle/",
      },
      {
        title: "Arızalar",
        route: "/layouts/arizalar/ariza/",
      },
    ],
  },
];

export default function CustomDrawerContent(props) {
  const router = useRouter();
  const { navigation } = props;
  const [activeRoute, setActiveRoute] = useState("/layouts/");
  const [expandedItems, setExpandedItems] = useState({});
  const insets = useSafeAreaInsets();

  const handleNavigation = (route) => {
    setActiveRoute(route);
    router.push(route);
    // Web platformunda da drawer'ı kapat
    closeDrawer();
  };

  const handleLogout = () => {
    closeDrawer();
    router.replace("/(screens)/Login");
  };

  const closeDrawer = () => {
    console.log("Attempting to close drawer...");
    try {
      // Önce standart drawer kapatma metodunu dene
      if (navigation.dispatch) {
        navigation.dispatch(DrawerActions.closeDrawer());
        console.log("Drawer closed with dispatch");
      } else if (navigation.closeDrawer) {
        navigation.closeDrawer();
        console.log("Drawer closed with closeDrawer");
      }
    } catch (error) {
      console.error("Error closing drawer:", error);
    }
  };

  const toggleExpand = (index) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderMenuItem = (item, index) => {
    const isExpanded = expandedItems[index];

    if (item.type === "expandable") {
      return (
        <View key={index}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => toggleExpand(index)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name={item.icon}
                size={20}
                color="#bdc3c7"
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
            <Ionicons
              name={isExpanded ? "chevron-down" : "chevron-forward"}
              size={16}
              color="#bdc3c7"
            />
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.subMenuContainer}>
              {item.children.map((child, childIndex) => (
                <TouchableOpacity
                  key={childIndex}
                  style={[
                    styles.subMenuItem,
                    activeRoute === child.route && styles.activeSubMenuItem,
                  ]}
                  onPress={() => handleNavigation(child.route)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.subMenuText,
                      activeRoute === child.route && styles.activeSubMenuText,
                    ]}
                  >
                    {child.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          key={index}
          style={[
            styles.menuItem,
            activeRoute === item.route && styles.activeMenuItem,
          ]}
          onPress={() => handleNavigation(item.route)}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons
              name={item.icon}
              size={20}
              color={activeRoute === item.route ? "#3498db" : "#bdc3c7"}
              style={styles.menuIcon}
            />
            <Text
              style={[
                styles.menuText,
                activeRoute === item.route && styles.activeMenuText,
              ]}
            >
              {item.title}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />

      {/* Header with close button */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="business" size={28} color="#3498db" />
          <Text style={styles.logoText}>Argın Mülk Yönetimi</Text>
        </View>
        <TouchableOpacity
          onPress={closeDrawer}
          style={styles.closeButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color="#ecf0f1" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.menuContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {menuItems.map((item, index) => renderMenuItem(item, index))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2c3e50",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#34495e",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoText: {
    color: "#ecf0f1",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  closeButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#34495e",
    minWidth: 40,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 10,
    marginVertical: 2,
    borderRadius: 8,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activeMenuItem: {
    backgroundColor: "#34495e",
  },
  menuIcon: {
    marginRight: 12,
    width: 20,
  },
  menuText: {
    color: "#bdc3c7",
    fontSize: 15,
    flex: 1,
  },
  activeMenuText: {
    color: "#3498db",
    fontWeight: "600",
  },
  subMenuContainer: {
    paddingLeft: 40,
    marginBottom: 5,
  },
  subMenuItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 10,
    marginVertical: 1,
    borderRadius: 6,
  },
  activeSubMenuItem: {
    backgroundColor: "#34495e",
  },
  subMenuText: {
    color: "#95a5a6",
    fontSize: 14,
  },
  activeSubMenuText: {
    color: "#3498db",
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#34495e",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  logoutText: {
    color: "#e74c3c",
    fontSize: 15,
    marginLeft: 12,
  },
});
