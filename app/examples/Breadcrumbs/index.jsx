import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";

function Breadcrumbs({ icon, title, route, light, onNavigate }) {
  const theme = useTheme();
  const routes = Array.isArray(route) ? route.slice(0, -1) : [];

  const handleNavigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const getTextColor = () => {
    return light ? "white" : theme.colors.onSurface;
  };

  const getOpacity = (isActive = false) => {
    if (isActive) return 1;
    return light ? 0.8 : 0.5;
  };

  return (
    <MDBox mr={{ xs: 0, xl: 8 }} style={{ marginRight: 0 }}>
      <MDBox
        style={{
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <TouchableOpacity onPress={() => handleNavigate("/")}>
          <MDTypography
            component="span"
            variant="body2"
            color={getTextColor()}
            opacity={getOpacity()}
            style={{
              lineHeight: 0,
              color: getTextColor(),
              opacity: getOpacity(),
              fontSize: 14,
            }}
          >
            <View style={{ color: getTextColor() }}>{icon}</View>
          </MDTypography>
        </TouchableOpacity>

        {routes.map((el, index) => (
          <View key={el} style={{ flexDirection: "row", alignItems: "center" }}>
            <MDTypography
              component="span"
              variant="button"
              fontWeight="regular"
              textTransform="capitalize"
              color={getTextColor()}
              opacity={getOpacity()}
              style={{
                lineHeight: 0,
                color: getTextColor(),
                opacity: getOpacity(),
                fontSize: 12,
                marginHorizontal: 4,
              }}
            >
              /
            </MDTypography>
            <TouchableOpacity onPress={() => handleNavigate(`/${el}`)}>
              <MDTypography
                component="span"
                variant="button"
                fontWeight="regular"
                textTransform="capitalize"
                color={getTextColor()}
                opacity={getOpacity()}
                style={{
                  lineHeight: 0,
                  color: getTextColor(),
                  opacity: getOpacity(),
                  fontSize: 12,
                  textTransform: "capitalize",
                }}
              >
                {el}
              </MDTypography>
            </TouchableOpacity>
          </View>
        ))}

        {routes.length > 0 && (
          <MDTypography
            component="span"
            variant="button"
            fontWeight="regular"
            textTransform="capitalize"
            color={getTextColor()}
            opacity={getOpacity()}
            style={{
              lineHeight: 0,
              color: getTextColor(),
              opacity: getOpacity(),
              fontSize: 12,
              marginHorizontal: 4,
            }}
          >
            /
          </MDTypography>
        )}

        <MDTypography
          variant="button"
          fontWeight="regular"
          textTransform="capitalize"
          color={getTextColor()}
          style={{
            lineHeight: 0,
            color: getTextColor(),
            fontSize: 12,
            textTransform: "capitalize",
          }}
        >
          {title.replace("-", " ")}
        </MDTypography>
      </MDBox>

      <MDTypography
        fontWeight="bold"
        textTransform="capitalize"
        variant="h6"
        color={getTextColor()}
        noWrap
        style={{
          fontWeight: "bold",
          textTransform: "capitalize",
          fontSize: 16,
          color: getTextColor(),
          marginTop: 8,
        }}
      >
        {title.replace("-", " ")}
      </MDTypography>
    </MDBox>
  );
}

// Setting default values for the props of Breadcrumbs
Breadcrumbs.defaultProps = {
  light: false,
  onNavigate: null,
};

// Typechecking props for the Breadcrumbs
Breadcrumbs.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  route: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  light: PropTypes.bool,
  onNavigate: PropTypes.func,
};

export default Breadcrumbs;
