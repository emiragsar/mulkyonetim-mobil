import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "react-native-paper";
import PropTypes from "prop-types";

const MDBadge = ({
  color = "info",
  variant = "gradient",
  size = "sm",
  circular = false,
  indicator = false,
  border = false,
  container = false,
  children,
  style,
  ...rest
}) => {
  const theme = useTheme();

  const getBadgeStyle = () => {
    let badgeStyle = {};

    // Size styles
    const sizeMap = {
      xs: { paddingHorizontal: 4, paddingVertical: 2, fontSize: 10 },
      sm: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
      md: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14 },
      lg: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 16 },
    };

    Object.assign(badgeStyle, sizeMap[size] || sizeMap.sm);

    // Circular styles
    if (circular) {
      badgeStyle.borderRadius =
        (badgeStyle.paddingHorizontal + badgeStyle.paddingVertical) * 2;
      badgeStyle.width =
        (badgeStyle.paddingHorizontal + badgeStyle.paddingVertical) * 2;
      badgeStyle.height =
        (badgeStyle.paddingHorizontal + badgeStyle.paddingVertical) * 2;
      badgeStyle.justifyContent = "center";
      badgeStyle.alignItems = "center";
    } else {
      badgeStyle.borderRadius = 12;
    }

    // Color styles
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

    if (variant === "gradient") {
      // For gradient, use solid color for now
      badgeStyle.backgroundColor = colorMap[color] || theme.colors.primary;
    } else if (variant === "contained") {
      badgeStyle.backgroundColor = colorMap[color] || theme.colors.primary;
    }

    // Border styles
    if (border) {
      badgeStyle.borderWidth = 1;
      badgeStyle.borderColor = colorMap[color] || theme.colors.primary;
    }

    // Indicator styles (small dot)
    if (indicator) {
      badgeStyle.width = 8;
      badgeStyle.height = 8;
      badgeStyle.borderRadius = 4;
      badgeStyle.paddingHorizontal = 0;
      badgeStyle.paddingVertical = 0;
    }

    return [badgeStyle, style];
  };

  const getTextStyle = () => {
    let textStyle = {
      color: "white",
      fontSize:
        size === "xs" ? 10 : size === "sm" ? 12 : size === "md" ? 14 : 16,
      fontWeight: "500",
    };

    // For light and dark variants, use dark text
    if (color === "light" || color === "dark") {
      textStyle.color = theme.colors.onSurface;
    }

    return textStyle;
  };

  if (indicator) {
    return <View style={getBadgeStyle()} {...rest} />;
  }

  return (
    <View style={getBadgeStyle()} {...rest}>
      {children ? <Text style={getTextStyle()}>{children}</Text> : null}
    </View>
  );
};

MDBadge.propTypes = {
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
  variant: PropTypes.oneOf(["gradient", "contained"]),
  size: PropTypes.oneOf(["xs", "sm", "md", "lg"]),
  circular: PropTypes.bool,
  indicator: PropTypes.bool,
  border: PropTypes.bool,
  children: PropTypes.node,
  container: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default MDBadge;
