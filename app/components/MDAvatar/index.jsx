import React from "react";
import { View, Image, Text } from "react-native";
import { Avatar, useTheme } from "react-native-paper";
import PropTypes from "prop-types";

const MDAvatar = ({
  bgColor = "transparent",
  size = "md",
  shadow = "none",
  src,
  alt,
  children,
  style,
  ...rest
}) => {
  const theme = useTheme();

  const getAvatarStyle = () => {
    let avatarStyle = {};

    // Size styles
    const sizeMap = {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
      xxl: 80,
    };

    const avatarSize = sizeMap[size] || sizeMap.md;
    avatarStyle.width = avatarSize;
    avatarStyle.height = avatarSize;
    avatarStyle.borderRadius = avatarSize / 2;

    // Background color
    if (bgColor !== "transparent") {
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
      avatarStyle.backgroundColor = colorMap[bgColor] || bgColor;
    }

    // Shadow styles
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
      Object.assign(avatarStyle, shadowMap[shadow]);
    }

    return [avatarStyle, style];
  };

  const getTextStyle = () => {
    const sizeMap = {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 20,
      xxl: 24,
    };

    return {
      fontSize: sizeMap[size] || sizeMap.md,
      color: "white",
      fontWeight: "500",
    };
  };

  // If image source is provided, use Image
  if (src) {
    return (
      <View style={getAvatarStyle()} {...rest}>
        <Image
          source={{ uri: src }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: (sizeMap[size] || sizeMap.md) / 2,
          }}
          resizeMode="cover"
        />
      </View>
    );
  }

  // If children are provided, use custom content
  if (children) {
    return (
      <View style={getAvatarStyle()} {...rest}>
        <Text style={getTextStyle()}>{children}</Text>
      </View>
    );
  }

  // Default avatar with initials or icon
  return (
    <Avatar.Text
      size={sizeMap[size] || sizeMap.md}
      label={alt || "U"}
      style={getAvatarStyle()}
      color="white"
      {...rest}
    />
  );
};

MDAvatar.propTypes = {
  bgColor: PropTypes.oneOf([
    "transparent",
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl", "xxl"]),
  shadow: PropTypes.oneOf([
    "none",
    "xs",
    "sm",
    "md",
    "lg",
    "xl",
    "xxl",
    "inset",
  ]),
  src: PropTypes.string,
  alt: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default MDAvatar;
