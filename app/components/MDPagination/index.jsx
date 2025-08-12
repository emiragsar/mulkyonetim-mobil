import React, { createContext, useContext, useMemo } from "react";
import { View } from "react-native";
import { IconButton, useTheme } from "react-native-paper";
import PropTypes from "prop-types";

// The Pagination main context
const Context = createContext();

const MDPagination = ({
  item = false,
  variant = "gradient",
  color = "info",
  size = "medium",
  active = false,
  children,
  style,
  ...rest
}) => {
  const theme = useTheme();

  const getPaginationStyle = () => {
    let paginationStyle = {};

    if (!item) {
      paginationStyle = {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
      };
    }

    return [paginationStyle, style];
  };

  const getItemStyle = () => {
    let itemStyle = {};

    // Size styles
    const sizeMap = {
      small: 32,
      medium: 40,
      large: 48,
    };

    const itemSize = sizeMap[size] || sizeMap.medium;
    itemStyle.width = itemSize;
    itemStyle.height = itemSize;
    itemStyle.borderRadius = itemSize / 2;

    // Color styles
    const colorMap = {
      white: theme.colors.surface,
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      info: theme.colors.primary,
      success: theme.colors.primary,
      warning: theme.colors.primary,
      error: theme.colors.error,
      light: theme.colors.surface,
      dark: theme.colors.surface,
    };

    if (active) {
      itemStyle.backgroundColor = colorMap[color] || theme.colors.primary;
    } else {
      itemStyle.backgroundColor = "transparent";
      itemStyle.borderWidth = 1;
      itemStyle.borderColor = theme.colors.outline;
    }

    return itemStyle;
  };

  const getIconColor = () => {
    if (active) {
      return "white";
    } else {
      return theme.colors.onSurface;
    }
  };

  const value = useMemo(
    () => ({ variant, color, size }),
    [variant, color, size]
  );

  return (
    <Context.Provider value={value}>
      {item ? (
        <IconButton
          {...rest}
          icon={children}
          size={size === "small" ? 16 : size === "large" ? 24 : 20}
          iconColor={getIconColor()}
          style={getItemStyle()}
          mode={active ? "contained" : "outlined"}
        />
      ) : (
        <View style={getPaginationStyle()}>{children}</View>
      )}
    </Context.Provider>
  );
};

MDPagination.propTypes = {
  item: PropTypes.bool,
  variant: PropTypes.oneOf(["gradient", "contained"]),
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
  size: PropTypes.oneOf(["small", "medium", "large"]),
  active: PropTypes.bool,
  children: PropTypes.node.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default MDPagination;
