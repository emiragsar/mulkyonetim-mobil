import React from "react";
import { Text } from "react-native";
import { useTheme } from "react-native-paper";
import PropTypes from "prop-types";

const MDTypography = ({
  color = "dark",
  fontWeight = false,
  textTransform = "none",
  verticalAlign = "unset",
  textGradient = false,
  opacity = 1,
  children,
  style,
  ...rest
}) => {
  const theme = useTheme();

  const getTextStyle = () => {
    let textStyle = {
      opacity,
    };

    // Color
    if (color !== "dark") {
      textStyle.color = theme.colors[color] || color;
    }

    // Font weight
    if (fontWeight) {
      const weightMap = {
        light: "300",
        regular: "400",
        medium: "500",
        bold: "700",
      };
      textStyle.fontWeight = weightMap[fontWeight] || "400";
    }

    // Text transform
    if (textTransform !== "none") {
      textStyle.textTransform = textTransform;
    }

    // Vertical align
    if (verticalAlign !== "unset") {
      textStyle.textAlignVertical = verticalAlign;
    }

    // Text gradient (simplified for mobile)
    if (textGradient) {
      // For mobile, we'll use a solid color instead of gradient
      // In a real implementation, you might want to use react-native-linear-gradient
      textStyle.color = theme.colors.primary;
    }

    return [textStyle, style];
  };

  return (
    <Text style={getTextStyle()} {...rest}>
      {children}
    </Text>
  );
};

MDTypography.propTypes = {
  color: PropTypes.oneOf([
    "inherit",
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
    "text",
    "white",
  ]),
  fontWeight: PropTypes.oneOf([false, "light", "regular", "medium", "bold"]),
  textTransform: PropTypes.oneOf([
    "none",
    "capitalize",
    "uppercase",
    "lowercase",
  ]),
  verticalAlign: PropTypes.oneOf([
    "unset",
    "baseline",
    "sub",
    "super",
    "text-top",
    "text-bottom",
    "middle",
    "top",
    "bottom",
  ]),
  textGradient: PropTypes.bool,
  children: PropTypes.node.isRequired,
  opacity: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default MDTypography;
