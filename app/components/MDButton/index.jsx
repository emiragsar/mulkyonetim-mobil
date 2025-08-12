import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import {
  Button,
  IconButton,
  FAB,
  Chip,
  SegmentedButtons,
} from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
// Material Dashboard 2 React Native theme
import theme from "../../assets/theme";

const MDButton = forwardRef(
  (
    {
      type,
      color,
      textColor,
      variant,
      size,
      circular,
      iconOnly,
      children,
      icon,
      disabled,
      onPress,
      style,
      loading,
      uppercase,
      compact,
      rippleColor,
      gradientColors,
      ...rest
    },
    ref
  ) => {
    // Farklı button tiplerini render et
    const renderButtonByType = () => {
      switch (type) {
        case "fab":
          return renderFAB();
        case "icon":
          return renderIconButton();
        case "chip":
          return renderChip();
        case "gradient":
          return renderGradientButton();
        case "segmented":
          return renderSegmentedButton();
        default:
          return renderStandardButton();
      }
    };

    // Standard Button
    const renderStandardButton = () => {
      const mode = getButtonMode();
      const buttonStyle = getStandardButtonStyle();

      return (
        <Button
          {...rest}
          ref={ref}
          mode={mode}
          buttonColor={getButtonColor()}
          textColor={getTextColor()}
          size={size}
          icon={icon}
          disabled={disabled}
          onPress={onPress}
          style={buttonStyle}
          loading={loading}
          uppercase={uppercase}
          compact={compact}
          rippleColor={rippleColor}
          contentStyle={getContentStyle()}
        >
          {children}
        </Button>
      );
    };

    // FAB Button
    const renderFAB = () => {
      const fabSize =
        size === "small" ? "small" : size === "large" ? "large" : "medium";

      return (
        <FAB
          {...rest}
          ref={ref}
          icon={icon || "plus"}
          size={fabSize}
          disabled={disabled}
          onPress={onPress}
          style={[styles.fab, { backgroundColor: getButtonColor() }, style]}
          color={getTextColor()}
          loading={loading}
          variant={variant === "outlined" ? "surface" : "primary"}
        />
      );
    };

    // Icon Button
    const renderIconButton = () => {
      const iconSize = size === "small" ? 16 : size === "large" ? 32 : 24;

      return (
        <IconButton
          {...rest}
          ref={ref}
          icon={icon || "heart"}
          size={iconSize}
          disabled={disabled}
          onPress={onPress}
          style={[getIconButtonStyle(), style]}
          iconColor={getIconColor()}
          mode={
            variant === "contained"
              ? "contained"
              : variant === "outlined"
              ? "outlined"
              : "standard"
          }
          loading={loading}
        />
      );
    };

    // Chip Button
    const renderChip = () => {
      return (
        <Chip
          {...rest}
          ref={ref}
          icon={icon}
          disabled={disabled}
          onPress={onPress}
          style={[styles.chip, style]}
          mode={variant === "outlined" ? "outlined" : "flat"}
          compact={compact}
          elevated={variant === "contained"}
          selectedColor={getButtonColor()}
          textStyle={{ color: getTextColor() }}
        >
          {children}
        </Chip>
      );
    };

    // Gradient Button
    const renderGradientButton = () => {
      const colors = gradientColors || ["#667eea", "#764ba2"];

      return (
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[getGradientButtonStyle(), style]}
        >
          <Button
            {...rest}
            ref={ref}
            mode="text"
            icon={icon}
            disabled={disabled}
            onPress={onPress}
            style={styles.gradientButtonInner}
            textColor={getTextColor()}
            loading={loading}
            uppercase={uppercase}
            compact={compact}
          >
            {children}
          </Button>
        </LinearGradient>
      );
    };

    // Segmented Button
    const renderSegmentedButton = () => {
      return (
        <View style={[styles.segmentedContainer, style]}>
          <Button
            {...rest}
            ref={ref}
            mode={variant === "outlined" ? "outlined" : "contained"}
            buttonColor={getButtonColor()}
            textColor={getTextColor()}
            disabled={disabled}
            onPress={onPress}
            style={styles.segmentedButton}
            compact
          >
            {children}
          </Button>
        </View>
      );
    };

    // Helper functions
    const getButtonMode = () => {
      switch (variant) {
        case "contained":
          return "contained";
        case "outlined":
          return "outlined";
        case "text":
          return "text";
        case "elevated":
          return "elevated";
        case "contained-tonal":
          return "contained-tonal";
        default:
          return "contained";
      }
    };

    // DÜZELTİLMİŞ getButtonColor - outlined için undefined döndür
    const getButtonColor = () => {
      // Outlined ve text variant'larda buttonColor undefined olmalı
      // Çünkü bunlar background color almaz, sadece border/text color alır
      if (variant === "outlined" || variant === "text") {
        return undefined;
      }

      // Diğer variant'larda color varsa onu, yoksa default primary
      if (color && theme.colors[color]) {
        return theme.colors[color].main;
      }
      return theme.colors.primary.main;
    };

    // DÜZELTİLMİŞ getTextColor
    const getTextColor = () => {
      // Eğer textColor prop'u verilmişse, onu kullan
      if (textColor) {
        return textColor;
      }

      // Outlined ve text variant'larda renk olarak color'u kullan
      if (variant === "outlined" || variant === "text") {
        if (color && theme.colors[color]) {
          return theme.colors[color].main;
        }
        return theme.colors.primary.main;
      }

      // Contained ve diğer variant'larda beyaz
      return "#FFFFFF";
    };

    // Icon rengi için ayrı fonksiyon
    const getIconColor = () => {
      if (textColor) {
        return textColor;
      }

      if (variant === "outlined" || variant === "text") {
        if (color && theme.colors[color]) {
          return theme.colors[color].main;
        }
        return theme.colors.primary.main;
      }

      return "#FFFFFF";
    };

    const getStandardButtonStyle = () => {
      const baseStyle = {};

      if (circular) {
        baseStyle.borderRadius = 50;
      }

      if (size === "small") {
        baseStyle.minHeight = 32;
      } else if (size === "large") {
        baseStyle.minHeight = 56;
      }

      // OUTLINED İÇİN BORDER COLOR AYARLA
      if (variant === "outlined" && color) {
        if (theme.colors[color]) {
          baseStyle.borderColor = theme.colors[color].main;
        } else {
          baseStyle.borderColor = color;
        }
        baseStyle.borderWidth = 1;
      }

      return [baseStyle, style];
    };

    const getIconButtonStyle = () => {
      const baseStyle = {};

      if (circular) {
        baseStyle.borderRadius = 50;
      }

      if (variant === "contained") {
        if (color && theme.colors[color]) {
          baseStyle.backgroundColor = theme.colors[color].main;
        } else {
          baseStyle.backgroundColor = color || theme.colors.primary.main;
        }
      } else if (variant === "outlined" && color) {
        if (theme.colors[color]) {
          baseStyle.borderColor = theme.colors[color].main;
        } else {
          baseStyle.borderColor = color;
        }
        baseStyle.borderWidth = 1;
      }

      return baseStyle;
    };

    const getGradientButtonStyle = () => {
      const baseStyle = {
        borderRadius: circular ? 50 : 5,
        minHeight: size === "small" ? 32 : size === "large" ? 56 : 40,
      };

      return baseStyle;
    };

    const getContentStyle = () => {
      const baseStyle = {};

      if (size === "small") {
        baseStyle.height = 32;
        baseStyle.paddingHorizontal = 12;
      } else if (size === "large") {
        baseStyle.height = 56;
        baseStyle.paddingHorizontal = 24;
      }

      return baseStyle;
    };

    return renderButtonByType();
  }
);

// Default props
MDButton.defaultProps = {
  type: "standard",
  size: "medium",
  variant: "contained",
  color: "#42A5F5",
  textColor: "#FFFFFF",
  circular: false,
  iconOnly: false,
  disabled: false,
  loading: false,
  uppercase: true,
  compact: false,
};

// PropTypes
MDButton.propTypes = {
  type: PropTypes.oneOf([
    "standard",
    "fab",
    "icon",
    "chip",
    "gradient",
    "segmented",
  ]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf([
    "text",
    "contained",
    "outlined",
    "elevated",
    "contained-tonal",
  ]),
  color: PropTypes.string,
  textColor: PropTypes.string,
  circular: PropTypes.bool,
  iconOnly: PropTypes.bool,
  icon: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  uppercase: PropTypes.bool,
  compact: PropTypes.bool,
  onPress: PropTypes.func,
  children: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  rippleColor: PropTypes.string,
  gradientColors: PropTypes.array,
};

const styles = StyleSheet.create({
  fab: {
    margin: 16,
  },
  chip: {
    margin: 4,
  },
  gradientButtonInner: {
    backgroundColor: "transparent",
    elevation: 0,
  },
  segmentedContainer: {
    flexDirection: "row",
    borderRadius: 5,
    overflow: "hidden",
  },
  segmentedButton: {
    flex: 1,
    borderRadius: 0,
  },
});

export default MDButton;
