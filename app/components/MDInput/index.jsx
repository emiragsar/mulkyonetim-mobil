import PropTypes from "prop-types";
import { forwardRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { HelperText, TextInput } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

const MDInput = forwardRef(
  (
    {
      error,
      success,
      disabled,
      label,
      placeholder,
      // Compatibility aliases used by some screens
      hasError,
      errorMessage,
      successMessage,
      rightIconName,
      leftIconName,
      onRightIconPress,
      onLeftIconPress,
      value,
      onChangeText,
      helperText,
      errorText,
      successText,
      variant,
      size,
      multiline,
      numberOfLines,
      secureTextEntry,
      keyboardType,
      autoCapitalize,
      autoCorrect,
      maxLength,
      editable,
      style,
      contentStyle,
      outlineStyle,
      theme,
      dense,
      left,
      right,
      showSoftInputOnFocus,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    // Normalize/compat for different prop names
    const resolvedError = typeof hasError === "boolean" ? hasError : !!error;
    const resolvedErrorText = errorMessage ?? errorText;
    const resolvedSuccessText = successMessage ?? successText;

    // Map placeholder to label to enable floating label behavior when label is not provided
    const finalLabel = label ?? placeholder;
    const finalPlaceholder = label ? placeholder : undefined;

    // Input modunu belirle
    const getInputMode = () => {
      switch (variant) {
        case "outlined":
          return "outlined";
        case "flat":
          return "flat";
        default:
          return "outlined";
      }
    };

    // Success/Error durumuna göre renkleri ayarla
    const getInputColors = () => {
      if (resolvedError) {
        return {
          activeOutlineColor: "#F44336",
          outlineColor: "#F44336",
          textColor: "#000000",
          placeholderTextColor: "#B0B0B0", // Daha soluk placeholder
        };
      }

      if (success) {
        return {
          activeOutlineColor: "#4CAF50",
          outlineColor: isFocused ? "#4CAF50" : "#E0E0E0",
          textColor: "#000000",
          placeholderTextColor: "#B0B0B0", // Daha soluk placeholder
        };
      }

      return {
        activeOutlineColor: "#42A5F5",
        outlineColor: isFocused ? "#42A5F5" : "#E0E0E0", // Soluk border
        textColor: "#000000",
        placeholderTextColor: "#B0B0B0", // Daha soluk placeholder
      };
    };

    // Success/Error iconlarını render et
    const renderStatusIcon = () => {
      if (resolvedError) {
        return (
          <TextInput.Icon
            icon={() => <Icon name="error" size={20} color="#F44336" />}
            onPress={() => {}}
          />
        );
      }

      if (success) {
        return (
          <TextInput.Icon
            icon={() => <Icon name="check-circle" size={20} color="#4CAF50" />}
            onPress={() => {}}
          />
        );
      }

      return null;
    };

    // Helper text'i belirle
    const getHelperText = () => {
      if (resolvedError && resolvedErrorText) {
        return resolvedErrorText;
      }
      if (success && resolvedSuccessText) {
        return resolvedSuccessText;
      }
      return helperText;
    };

    // Helper text rengini belirle
    const getHelperTextType = () => {
      if (resolvedError) return "error";
      if (success) return "info"; // Paper'da success tipi yok, info kullanıyoruz
      return "info";
    };

    // Input boyutunu ayarla
    const getInputStyle = () => {
      const colors = getInputColors();
      const baseStyle = {
        backgroundColor: disabled ? "#F5F5F5" : "#FFFFFF",
        minHeight: size === "small" ? 48 : 56,
      };

      if (size === "small") {
        baseStyle.fontSize = 13;
        baseStyle.minHeight = 48;
      } else if (size === "large") {
        baseStyle.fontSize = 18;
        baseStyle.minHeight = 64;
      }

      return [baseStyle, style];
    };

    const colors = getInputColors();

    const resolvedLeftIcon = leftIconName ? (
      <TextInput.Icon
        icon={() => (
          <Icon name={leftIconName} size={20} color={colors.outlineColor} />
        )}
        onPress={onLeftIconPress}
      />
    ) : (
      left
    );

    const resolvedRightIcon = right ? (
      right
    ) : rightIconName ? (
      <TextInput.Icon
        icon={() => (
          <Icon name={rightIconName} size={20} color={colors.outlineColor} />
        )}
        onPress={onRightIconPress}
      />
    ) : (
      renderStatusIcon()
    );

    return (
      <View style={styles.container}>
        <TextInput
          {...rest}
          ref={ref}
          mode={getInputMode()}
          label={finalLabel}
          placeholder={finalPlaceholder}
          value={value}
          onChangeText={onChangeText}
          error={resolvedError}
          disabled={disabled}
          editable={editable !== undefined ? editable : !disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          dense={dense}
          showSoftInputOnFocus={showSoftInputOnFocus}
          style={getInputStyle()}
          contentStyle={[styles.contentStyle, contentStyle]}
          outlineStyle={[
            styles.outlineStyle,
            isFocused && styles.focusedOutlineStyle, // Focus durumunda kalın border
            outlineStyle,
          ]}
          activeOutlineColor={colors.activeOutlineColor}
          outlineColor={colors.outlineColor}
          textColor={colors.textColor}
          placeholderTextColor={colors.placeholderTextColor}
          theme={{
            colors: {
              onSurfaceVariant: "#444444", // Label rengi (daha koyu)
              outline: colors.outlineColor,
              primary: colors.activeOutlineColor,
            },
            fonts: {
              bodySmall: { fontSize: 12 }, // Label font boyutu
            },
            ...theme,
          }}
          left={resolvedLeftIcon}
          right={resolvedRightIcon}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus && rest.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur && rest.onBlur(e);
          }}
        />

        {/* Helper Text */}
        {getHelperText() && (
          <HelperText
            type={getHelperTextType()}
            visible={true}
            style={[
              styles.helperText,
              resolvedError && styles.errorHelperText,
              success && styles.successHelperText,
            ]}
          >
            {getHelperText()}
          </HelperText>
        )}
      </View>
    );
  }
);

// Default props
MDInput.defaultProps = {
  error: false,
  success: false,
  disabled: false,
  variant: "outlined",
  size: "medium",
  multiline: false,
  numberOfLines: 1,
  secureTextEntry: false,
  keyboardType: "default",
  autoCapitalize: "none",
  autoCorrect: false,
  dense: false,
  editable: true,
  showSoftInputOnFocus: true,
};

// PropTypes
MDInput.propTypes = {
  error: PropTypes.bool,
  hasError: PropTypes.bool,
  success: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  errorMessage: PropTypes.string,
  successMessage: PropTypes.string,
  rightIconName: PropTypes.string,
  leftIconName: PropTypes.string,
  onRightIconPress: PropTypes.func,
  onLeftIconPress: PropTypes.func,
  value: PropTypes.string,
  onChangeText: PropTypes.func,
  helperText: PropTypes.string,
  errorText: PropTypes.string,
  successText: PropTypes.string,
  variant: PropTypes.oneOf(["outlined", "flat"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  multiline: PropTypes.bool,
  numberOfLines: PropTypes.number,
  secureTextEntry: PropTypes.bool,
  keyboardType: PropTypes.oneOf([
    "default",
    "number-pad",
    "decimal-pad",
    "numeric",
    "email-address",
    "phone-pad",
    "url",
    "ascii-capable",
    "numbers-and-punctuation",
    "name-phone-pad",
    "twitter",
    "web-search",
    "visible-password",
  ]),
  autoCapitalize: PropTypes.oneOf(["none", "sentences", "words", "characters"]),
  autoCorrect: PropTypes.bool,
  maxLength: PropTypes.number,
  editable: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  contentStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  outlineStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  theme: PropTypes.object,
  dense: PropTypes.bool,
  left: PropTypes.node,
  right: PropTypes.node,
  showSoftInputOnFocus: PropTypes.bool,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  contentStyle: {
    paddingVertical: 8,
    paddingHorizontal: 12, // Sağdan başlama için padding artır
  },
  outlineStyle: {
    borderRadius: 6,
    borderWidth: 0.8, // Normal durum - ince border
  },
  focusedOutlineStyle: {
    borderWidth: 2, // Focus durumunda kalın border
  },
  helperText: {
    fontSize: 11,
    marginTop: 2,
    marginLeft: 4,
  },
  errorHelperText: {
    color: "#F44336",
  },
  successHelperText: {
    color: "#4CAF50",
  },
});

export default MDInput;
