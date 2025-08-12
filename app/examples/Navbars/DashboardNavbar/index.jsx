import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Appbar, useTheme } from "react-native-paper";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "@/app/components/MDBox";
import MDTypography from "@/app/components/MDTypography";

// Material Dashboard 2 React example components
import Breadcrumbs from "../../Breadcrumbs";

function DashboardNavbar({
  title,
  onMenuPress,
  onSettingsPress,
  onProfilePress,
  light,
}) {
  const theme = useTheme();

  const getIconColor = () => {
    return light ? "white" : theme.colors.onSurface;
  };

  return (
    <Appbar.Header
      style={{
        backgroundColor: light ? theme.colors.primary : theme.colors.surface,
        elevation: 4,
      }}
    >
      <Appbar.Action icon="menu" color={getIconColor()} onPress={onMenuPress} />
      <Appbar.Content
        title={
          <MDTypography
            variant="h6"
            fontWeight="medium"
            color={light ? "white" : "dark"}
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: light ? "white" : theme.colors.onSurface,
            }}
          >
            {title}
          </MDTypography>
        }
        titleStyle={{ color: getIconColor() }}
      />
      <Appbar.Action
        icon="account-circle"
        color={getIconColor()}
        onPress={onProfilePress}
      />
      <Appbar.Action
        icon="cog"
        color={getIconColor()}
        onPress={onSettingsPress}
      />
    </Appbar.Header>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  light: false,
  onMenuPress: null,
  onSettingsPress: null,
  onProfilePress: null,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  title: PropTypes.string.isRequired,
  light: PropTypes.bool,
  onMenuPress: PropTypes.func,
  onSettingsPress: PropTypes.func,
  onProfilePress: PropTypes.func,
};

export default DashboardNavbar;
