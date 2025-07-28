import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CustomDrawerContent from "../components/CustomDrawerContent";

function CustomHeader({ title }) {
  const navigation = useNavigation();
  const router = useRouter();

  const handleMenuPress = () => {
    console.log("Menu button pressed");
    try {
      if (navigation && navigation.dispatch) {
        navigation.dispatch(DrawerActions.toggleDrawer());
      } else if (navigation && navigation.toggleDrawer) {
        navigation.toggleDrawer();
      } else {
        console.log("No navigation methods available");
      }
    } catch (error) {
      console.error("Menu toggle error:", error);
    }
  };

  const handleSettingsPress = () => {
    router.push("/layouts/Settings");
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={handleMenuPress}
        activeOpacity={0.7}
      >
        <Ionicons name="menu" size={24} color="#2c3e50" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={22} color="#2c3e50" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleSettingsPress}
        >
          <Ionicons name="settings-outline" size={22} color="#2c3e50" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function LayoutsLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={CustomDrawerContent}
        screenOptions={{
          headerShown: true,
          header: ({ route }) => {
            let title = "Dashboard";

            // Nested route'lar için title belirleme
            if (route.name === "index") {
              title = "Dashboard";
            } else if (route.name.includes("kisiler")) {
              if (route.name.includes("kisi_ekle")) {
                title = "Kişi Ekle";
              } else if (route.name.includes("evsahipleri")) {
                title = "Ev Sahipleri";
              } else if (route.name.includes("kiracilar")) {
                title = "Kiracılar";
              } else if (route.name.includes("ustalar")) {
                title = "Ustalar";
              } else if (route.name.includes("yatirimcilar")) {
                title = "Yatırımcılar";
              }
            } else if (route.name.includes("daireler")) {
              if (route.name.includes("daire_ekle")) {
                title = "Daire Ekle";
              } else if (route.name.includes("tumdaireler")) {
                title = "Tüm Daireler";
              } else if (route.name.includes("kiracilidaireler")) {
                title = "Kiracılı Daireler";
              } else if (route.name.includes("bosdaireler")) {
                title = "Boş Daireler";
              } else if (route.name.includes("tahliye_edilecekler")) {
                title = "Tahliye Edilecekler";
              } else if (route.name.includes("teknik_takip")) {
                title = "Teknik Takip";
              }
            } else if (route.name.includes("kontratlar")) {
              if (route.name.includes("kontrat_yonetim")) {
                title = "Kontrat Yönetim";
              } else if (route.name.includes("kontrat")) {
                title = "Kira Kontratları";
              }
            } else if (route.name.includes("finans")) {
              if (route.name.includes("transferler")) {
                title = "Transferler";
              } else if (route.name.includes("kisibasigelirgider")) {
                title = "Kişi Bazlı Gelir/Gider";
              } else if (route.name.includes("donemselfinansal")) {
                title = "Dönemsel Finansal Özet";
              }
            } else if (route.name.includes("arizalar")) {
              if (route.name.includes("ariza_ekle")) {
                title = "Arıza Ekle";
              } else if (route.name.includes("ariza")) {
                title = "Arızalar";
              }
            } else if (route.name === "Settings") {
              title = "Ayarlar";
            } else {
              title = route.name;
            }

            return <CustomHeader title={title} />;
          },
          drawerStyle: {
            backgroundColor: "#2c3e50",
            width: 280,
          },
          drawerActiveTintColor: "#3498db",
          drawerInactiveTintColor: "#ecf0f1",
          drawerType: "front",
          overlayColor: "rgba(0,0,0,0.5)",
          swipeEnabled: true,
          swipeEdgeWidth: 50,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />

        {/* Kişiler Alt Klasörleri */}
        <Drawer.Screen
          name="kisiler/kisi_ekle/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="kisiler/evsahipleri/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="kisiler/kiracilar/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="kisiler/ustalar/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="kisiler/yatirimcilar/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />

        {/* Daireler Alt Klasörleri */}
        <Drawer.Screen
          name="daireler/daire_ekle/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="daireler/tumdaireler/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="daireler/kiracilidaireler/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="daireler/bosdaireler/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="daireler/tahliye_edilecekler/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="daireler/teknik_takip/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />

        {/* Kontratlar Alt Klasörleri */}
        <Drawer.Screen
          name="kontratlar/kontrat/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="kontratlar/kontrat_yonetim/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />

        {/* Finans Alt Klasörleri */}
        <Drawer.Screen
          name="finans/transferler/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="finans/kisibasigelirgider/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="finans/donemselfinansal/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />

        {/* Arızalar Alt Klasörleri */}
        <Drawer.Screen
          name="arizalar/ariza_ekle/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="arizalar/ariza/index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />

        {/* Settings */}
        <Drawer.Screen
          name="Settings"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 3,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      web: {
        boxShadow: "0 2px 3px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  menuButton: {
    padding: 8,
    borderRadius: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 6,
  },
});
