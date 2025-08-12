import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";

const NotificationItem = ({ icon, title, onPress, ...rest }) => {
  const theme = useTheme();

  const menuItemStyle = {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  };

  return (
    <TouchableOpacity {...rest} style={menuItemStyle} onPress={onPress}>
      <MDBox
        py={0.5}
        display="flex"
        alignItems="center"
        lineHeight={1}
        style={{
          paddingVertical: 2,
          flexDirection: "row",
          alignItems: "center",
          lineHeight: 1,
        }}
      >
        <MDTypography
          variant="body1"
          color="secondary"
          lineHeight={0.75}
          style={{
            fontSize: 16,
            color: theme.colors.secondary,
            lineHeight: 0.75,
          }}
        >
          {icon}
        </MDTypography>
        <MDTypography
          variant="button"
          fontWeight="regular"
          style={{
            marginLeft: 8,
            fontSize: 14,
            fontWeight: "400",
            color: theme.colors.onSurface,
          }}
        >
          {title}
        </MDTypography>
      </MDBox>
    </TouchableOpacity>
  );
};

// Typechecking props for the NotificationItem
NotificationItem.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func,
};

export default NotificationItem;
