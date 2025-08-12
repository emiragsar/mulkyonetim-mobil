import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Card, Text, IconButton, useTheme } from "react-native-paper";
import PropTypes from "prop-types";

const MDAlert = ({
  color = "info",
  dismissible = false,
  children,
  style,
  ...rest
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
  };

  const getAlertStyle = () => {
    let alertStyle = {
      marginBottom: 16,
      borderRadius: 12,
      padding: 16,
      minHeight: 60,
    };

    // Background color based on color prop
    const colorMap = {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      info: theme.colors.primary,
      success: theme.colors.primary,
      warning: theme.colors.primary,
      error: theme.colors.error,
      light: theme.colors.surface,
      dark: theme.colors.surface,
    };

    alertStyle.backgroundColor = colorMap[color] || theme.colors.primary;

    return [alertStyle, style];
  };

  const getTextColor = () => {
    // For most colors, use white text
    if (color === "light" || color === "dark") {
      return theme.colors.onSurface;
    }
    return "white";
  };

  if (!visible) {
    return null;
  }

  return (
    <Card style={getAlertStyle()} {...rest}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: getTextColor(), flex: 1 }}>{children}</Text>
        </View>
        {dismissible && (
          <IconButton
            icon="close"
            size={20}
            iconColor={getTextColor()}
            onPress={handleDismiss}
            style={{ margin: 0 }}
          />
        )}
      </View>
    </Card>
  );
};

MDAlert.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  dismissible: PropTypes.bool,
  children: PropTypes.node.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default MDAlert;
