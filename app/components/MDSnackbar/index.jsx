import React from "react";
import { View } from "react-native";
import { Snackbar, Text, IconButton, useTheme } from "react-native-paper";
import PropTypes from "prop-types";

const MDSnackbar = ({
  color = "info",
  icon,
  title,
  dateTime,
  content,
  close,
  bgWhite = false,
  visible,
  onDismiss,
  style,
  ...rest
}) => {
  const theme = useTheme();

  const getSnackbarStyle = () => {
    let snackbarStyle = {
      backgroundColor: bgWhite
        ? theme.colors.surface
        : theme.colors[color] || theme.colors.primary,
      borderRadius: 12,
      margin: 16,
    };

    return [snackbarStyle, style];
  };

  const getTitleColor = () => {
    if (bgWhite) {
      return theme.colors[color] || theme.colors.primary;
    } else if (color === "light") {
      return theme.colors.onSurface;
    } else {
      return "white";
    }
  };

  const getContentColor = () => {
    if (bgWhite || color === "light") {
      return theme.colors.onSurface;
    } else {
      return "white";
    }
  };

  const getDateTimeColor = () => {
    if (bgWhite) {
      return theme.colors.onSurface;
    } else if (color === "light") {
      return theme.colors.onSurface;
    } else {
      return "white";
    }
  };

  const renderContent = () => (
    <View style={{ padding: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text
            style={{
              color: getTitleColor(),
              fontWeight: "500",
              fontSize: 14,
              flex: 1,
            }}
          >
            {title}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              color: getDateTimeColor(),
              fontSize: 12,
              marginRight: 8,
            }}
          >
            {dateTime}
          </Text>
          <IconButton
            icon="close"
            size={16}
            iconColor={getTitleColor()}
            onPress={close}
            style={{ margin: 0 }}
          />
        </View>
      </View>
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: bgWhite
            ? theme.colors.outline
            : "rgba(255,255,255,0.2)",
          paddingTop: 8,
        }}
      >
        <Text
          style={{
            color: getContentColor(),
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          {content}
        </Text>
      </View>
    </View>
  );

  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss || close}
      duration={5000}
      style={getSnackbarStyle()}
      {...rest}
    >
      {renderContent()}
    </Snackbar>
  );
};

MDSnackbar.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
    "light",
  ]),
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  dateTime: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired,
  close: PropTypes.func.isRequired,
  bgWhite: PropTypes.bool,
  visible: PropTypes.bool,
  onDismiss: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default MDSnackbar;
