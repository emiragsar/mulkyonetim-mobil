import React from "react";
import { View } from "react-native";
import { ProgressBar, Text, useTheme } from "react-native-paper";
import PropTypes from "prop-types";

const MDProgress = ({
  variant = "contained",
  color = "info",
  value = 0,
  label = false,
  style,
  ...rest
}) => {
  const theme = useTheme();

  const getProgressColor = () => {
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

    return colorMap[color] || theme.colors.primary;
  };

  const getProgressStyle = () => {
    let progressStyle = {
      height: 8,
      borderRadius: 4,
    };

    return [progressStyle, style];
  };

  return (
    <View>
      {label && (
        <Text
          style={{
            color: theme.colors.onSurface,
            fontWeight: "500",
            fontSize: 14,
            marginBottom: 8,
          }}
        >
          {value}%
        </Text>
      )}
      <ProgressBar
        progress={value / 100}
        color={getProgressColor()}
        style={getProgressStyle()}
        {...rest}
      />
    </View>
  );
};

MDProgress.propTypes = {
  variant: PropTypes.oneOf(["contained", "gradient"]),
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
  value: PropTypes.number,
  label: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default MDProgress;
