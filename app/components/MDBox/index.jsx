import React from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";
import PropTypes from "prop-types";

const MDBox = ({
  variant = "contained",
  bgColor = "transparent",
  color = "dark",
  opacity = 1,
  borderRadius = "none",
  shadow = "none",
  coloredShadow = "none",
  children,
  style,
  ...rest
}) => {
  const theme = useTheme();

  const getBoxStyle = () => {
    let boxStyle = {
      opacity,
    };

    // Background color
    if (variant === "gradient") {
      // For gradient, we'll use a solid color for now
      // In a real implementation, you might want to use react-native-linear-gradient
      boxStyle.backgroundColor = theme.colors[bgColor] || bgColor;
    } else {
      boxStyle.backgroundColor = theme.colors[bgColor] || bgColor;
    }

    // Text color
    if (color !== "dark") {
      boxStyle.color = theme.colors[color] || color;
    }

    // Border radius
    if (borderRadius !== "none") {
      const radiusMap = {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
        section: 16,
      };
      boxStyle.borderRadius = radiusMap[borderRadius] || 0;
    }

    // Shadow
    if (shadow !== "none") {
      const shadowMap = {
        xs: {
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 1,
          elevation: 1,
        },
        sm: {
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        },
        md: {
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
        },
        lg: {
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 8,
        },
        xl: {
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 12,
        },
        xxl: {
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 16,
        },
        inset: {
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: -1,
        },
      };
      Object.assign(boxStyle, shadowMap[shadow]);
    }

    // Colored shadow
    if (coloredShadow !== "none") {
      const shadowColor = theme.colors[coloredShadow];
      if (shadowColor) {
        boxStyle.shadowColor = shadowColor;
        boxStyle.elevation = 8;
      }
    }

    return [boxStyle, style];
  };

  return (
    <View style={getBoxStyle()} {...rest}>
      {children}
    </View>
  );
};

MDBox.propTypes = {
  variant: PropTypes.oneOf(["contained", "gradient"]),
  bgColor: PropTypes.string,
  color: PropTypes.string,
  opacity: PropTypes.number,
  borderRadius: PropTypes.string,
  shadow: PropTypes.string,
  coloredShadow: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
    "none",
  ]),
  children: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default MDBox;
