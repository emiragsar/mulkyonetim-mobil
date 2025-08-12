import React from "react";
import { StyleSheet } from "react-native";
import { Button, useTheme } from "react-native-paper";
import PropTypes from "prop-types";

const MDButton = ({
  color = "primary",
  variant = "contained",
  size = "medium",
  circular = false,
  iconOnly = false,
  children,
  style,
  ...rest
}) => {
  const theme = useTheme();

  const getButtonStyle = () => {
    let buttonStyle = {};

    // Size styles
    if (size === "small") {
      buttonStyle.height = 32;
      buttonStyle.paddingHorizontal = 12;
    } else if (size === "large") {
      buttonStyle.height = 56;
      buttonStyle.paddingHorizontal = 24;
    } else {
      buttonStyle.height = 40;
      buttonStyle.paddingHorizontal = 16;
    }

    // Circular styles
    if (circular) {
      buttonStyle.borderRadius = buttonStyle.height / 2;
    }

    // Icon only styles
    if (iconOnly) {
      buttonStyle.width = buttonStyle.height;
      buttonStyle.paddingHorizontal = 0;
      buttonStyle.justifyContent = "center";
      buttonStyle.alignItems = "center";
    }

    // Variant styles
    if (variant === "outlined") {
      buttonStyle.borderWidth = 1;
      buttonStyle.borderColor = theme.colors[color] || theme.colors.primary;
      buttonStyle.backgroundColor = "transparent";
    } else if (variant === "text") {
      buttonStyle.backgroundColor = "transparent";
    }

    return [buttonStyle, style];
  };

  const getTextColor = () => {
    if (variant === "contained") {
      return "white";
    } else if (variant === "outlined" || variant === "text") {
      return theme.colors[color] || theme.colors.primary;
    }
    return "white";
  };

  const getMode = () => {
    if (variant === "contained") return "contained";
    if (variant === "outlined") return "outlined";
    if (variant === "text") return "text";
    return "contained";
  };

  return (
    <Button
      mode={getMode()}
      buttonColor={
        variant === "contained"
          ? theme.colors[color] || theme.colors.primary
          : undefined
      }
      textColor={getTextColor()}
      style={getButtonStyle()}
      contentStyle={iconOnly ? { margin: 0 } : undefined}
      {...rest}
    >
      {children}
    </Button>
  );
};

MDButton.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["text", "contained", "outlined", "gradient"]),
  color: PropTypes.oneOf([
    "white",
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  circular: PropTypes.bool,
  iconOnly: PropTypes.bool,
  children: PropTypes.node.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default MDButton;
