import React from "react";
import { View, Image } from "react-native";
import { Card, useTheme } from "react-native-paper";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";

function MasterCard({ color, number, holder, expires }) {
  const theme = useTheme();
  const numbers = [...`${number}`];

  if (numbers.length < 16 || numbers.length > 16) {
    throw new Error(
      "Invalid value for the prop number, the value for the number prop shouldn't be greater than or less than 16 digits"
    );
  }

  const num1 = numbers.slice(0, 4).join("");
  const num2 = numbers.slice(4, 8).join("");
  const num3 = numbers.slice(8, 12).join("");
  const num4 = numbers.slice(12, 16).join("");

  const getGradientStyle = () => {
    const colorMap = {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      info: theme.colors.primary,
      success: theme.colors.primary,
      warning: theme.colors.primary,
      error: theme.colors.error,
      dark: theme.colors.surface,
    };

    return {
      backgroundColor: colorMap[color] || theme.colors.primary,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    };
  };

  return (
    <Card style={[{ margin: 8 }, getGradientStyle()]}>
      <MDBox position="relative" zIndex={2} p={2} style={{ padding: 16 }}>
        <MDBox
          color="white"
          p={1}
          lineHeight={0}
          display="inline-block"
          style={{ color: "white", padding: 4 }}
        >
          <MDTypography style={{ color: "white" }}>📶</MDTypography>
        </MDBox>
        <MDTypography
          variant="h5"
          color="white"
          fontWeight="medium"
          style={{
            marginTop: 12,
            marginBottom: 20,
            paddingBottom: 4,
            fontSize: 18,
            fontWeight: "500",
            color: "white",
          }}
        >
          {num1}&nbsp;&nbsp;&nbsp;{num2}&nbsp;&nbsp;&nbsp;{num3}
          &nbsp;&nbsp;&nbsp;{num4}
        </MDTypography>
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <MDBox
            display="flex"
            alignItems="center"
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <MDBox
              mr={3}
              lineHeight={1}
              style={{ marginRight: 12, lineHeight: 1 }}
            >
              <MDTypography
                variant="button"
                color="white"
                fontWeight="regular"
                opacity={0.8}
                style={{ fontSize: 10, color: "white", opacity: 0.8 }}
              >
                Card Holder
              </MDTypography>
              <MDTypography
                variant="h6"
                color="white"
                fontWeight="medium"
                textTransform="capitalize"
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "white",
                  textTransform: "capitalize",
                }}
              >
                {holder}
              </MDTypography>
            </MDBox>
            <MDBox lineHeight={1}>
              <MDTypography
                variant="button"
                color="white"
                fontWeight="regular"
                opacity={0.8}
                style={{ fontSize: 10, color: "white", opacity: 0.8 }}
              >
                Expires
              </MDTypography>
              <MDTypography
                variant="h6"
                color="white"
                fontWeight="medium"
                style={{ fontSize: 14, fontWeight: "500", color: "white" }}
              >
                {expires}
              </MDTypography>
            </MDBox>
          </MDBox>
          <MDBox
            display="flex"
            justifyContent="flex-end"
            width="20%"
            style={{ justifyContent: "flex-end", width: "20%" }}
          >
            <View style={{ width: "60%", marginTop: 4 }}>
              <View
                style={{
                  width: 40,
                  height: 25,
                  backgroundColor: "white",
                  borderRadius: 4,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MDTypography
                  style={{ fontSize: 8, color: theme.colors.primary }}
                >
                  MC
                </MDTypography>
              </View>
            </View>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of MasterCard
MasterCard.defaultProps = {
  color: "dark",
};

// Typechecking props for the MasterCard
MasterCard.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
  ]),
  number: PropTypes.number.isRequired,
  holder: PropTypes.string.isRequired,
  expires: PropTypes.string.isRequired,
};

export default MasterCard;
