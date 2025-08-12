import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Card, Switch, useTheme, IconButton } from "react-native-paper";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";
import MDButton from "../../components/MDButton";

function Configurator({
  visible,
  onClose,
  onThemeChange,
  onSidenavColorChange,
  onFixedNavbarChange,
  currentTheme,
  currentSidenavColor,
  fixedNavbar,
}) {
  const theme = useTheme();
  const sidenavColors = [
    "primary",
    "dark",
    "info",
    "success",
    "warning",
    "error",
  ];

  if (!visible) return null;

  return (
    <Card
      style={{
        position: "absolute",
        top: 60,
        right: 16,
        width: 300,
        zIndex: 1000,
        elevation: 8,
      }}
    >
      <ScrollView>
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="baseline"
          pt={4}
          pb={0.5}
          px={3}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingTop: 32,
            paddingBottom: 4,
            paddingHorizontal: 24,
          }}
        >
          <MDBox>
            <MDTypography
              variant="h5"
              style={{ fontSize: 20, fontWeight: "bold" }}
            >
              Özelleştir
            </MDTypography>
            <MDTypography
              variant="body2"
              color="text"
              style={{ fontSize: 12, color: theme.colors.onSurface }}
            >
              Görünüm seçenekleri
            </MDTypography>
          </MDBox>

          <IconButton
            icon="close"
            size={20}
            onPress={onClose}
            style={{ margin: 0 }}
          />
        </MDBox>

        <View
          style={{
            height: 1,
            backgroundColor: theme.colors.outline,
            marginHorizontal: 16,
          }}
        />

        <MDBox
          pt={0.5}
          pb={3}
          px={3}
          style={{ paddingTop: 4, paddingBottom: 24, paddingHorizontal: 24 }}
        >
          <MDBox>
            <MDTypography
              variant="h6"
              style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}
            >
              Dikey Menü Renkleri
            </MDTypography>

            <MDBox
              mb={0.5}
              style={{
                flexDirection: "row",
                marginBottom: 4,
                flexWrap: "wrap",
              }}
            >
              {sidenavColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor:
                      theme.colors[color] || theme.colors.primary,
                    marginRight: 8,
                    marginBottom: 8,
                    borderWidth: currentSidenavColor === color ? 2 : 1,
                    borderColor:
                      currentSidenavColor === color
                        ? theme.colors.onSurface
                        : theme.colors.outline,
                  }}
                  onPress={() => onSidenavColorChange(color)}
                />
              ))}
            </MDBox>
          </MDBox>

          <MDBox
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={3}
            lineHeight={1}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 24,
            }}
          >
            <MDTypography
              variant="h6"
              style={{ fontSize: 16, fontWeight: "600" }}
            >
              Menüyü Sabitle
            </MDTypography>

            <Switch value={fixedNavbar} onValueChange={onFixedNavbarChange} />
          </MDBox>

          <View
            style={{
              height: 1,
              backgroundColor: theme.colors.outline,
              marginVertical: 16,
            }}
          />

          <MDBox
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            lineHeight={1}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <MDTypography
              variant="h6"
              style={{ fontSize: 16, fontWeight: "600" }}
            >
              Açık / Koyu
            </MDTypography>

            <Switch
              value={currentTheme === "dark"}
              onValueChange={onThemeChange}
            />
          </MDBox>

          <View
            style={{
              height: 1,
              backgroundColor: theme.colors.outline,
              marginVertical: 16,
            }}
          />

          <MDBox mt={3} mb={2} style={{ marginTop: 24, marginBottom: 16 }}>
            <MDButton
              variant="outlined"
              color={currentTheme === "dark" ? "light" : "dark"}
              style={{ width: "100%" }}
            >
              Kullanım Kılavuzu
            </MDButton>
          </MDBox>
        </MDBox>
      </ScrollView>
    </Card>
  );
}

// Setting default values for the props of Configurator
Configurator.defaultProps = {
  visible: false,
  currentTheme: "light",
  currentSidenavColor: "primary",
  fixedNavbar: false,
  onClose: null,
  onThemeChange: null,
  onSidenavColorChange: null,
  onFixedNavbarChange: null,
};

// Typechecking props for the Configurator
Configurator.propTypes = {
  visible: PropTypes.bool,
  currentTheme: PropTypes.oneOf(["light", "dark"]),
  currentSidenavColor: PropTypes.oneOf([
    "primary",
    "dark",
    "info",
    "success",
    "warning",
    "error",
  ]),
  fixedNavbar: PropTypes.bool,
  onClose: PropTypes.func,
  onThemeChange: PropTypes.func,
  onSidenavColorChange: PropTypes.func,
  onFixedNavbarChange: PropTypes.func,
};

export default Configurator;
