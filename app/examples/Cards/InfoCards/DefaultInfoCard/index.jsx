import React from "react";
import { View } from "react-native";
import { Card, Divider, useTheme } from "react-native-paper";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";

function DefaultInfoCard({ color, icon, title, description, value }) {
  const theme = useTheme();

  return (
    <Card style={{ margin: 8 }}>
      <MDBox
        p={2}
        mx={3}
        display="flex"
        justifyContent="center"
        style={{ padding: 16, marginHorizontal: 24, justifyContent: "center" }}
      >
        <MDBox
          display="grid"
          justifyContent="center"
          alignItems="center"
          bgColor={color}
          color="white"
          width="4rem"
          height="4rem"
          shadow="md"
          borderRadius="lg"
          variant="gradient"
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors[color] || theme.colors.primary,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          {icon}
        </MDBox>
      </MDBox>
      <MDBox
        pb={2}
        px={2}
        textAlign="center"
        lineHeight={1.25}
        style={{
          paddingBottom: 16,
          paddingHorizontal: 16,
          alignItems: "center",
        }}
      >
        <MDTypography
          variant="h6"
          fontWeight="medium"
          textTransform="capitalize"
          style={{
            fontSize: 16,
            fontWeight: "500",
            textTransform: "capitalize",
          }}
        >
          {title}
        </MDTypography>
        {description && (
          <MDTypography
            variant="caption"
            color="text"
            fontWeight="regular"
            style={{
              fontSize: 12,
              color: theme.colors.onSurface,
              marginTop: 4,
            }}
          >
            {description}
          </MDTypography>
        )}
        {description && !value ? null : (
          <Divider style={{ marginVertical: 8 }} />
        )}
        {value && (
          <MDTypography
            variant="h5"
            fontWeight="medium"
            style={{ fontSize: 20, fontWeight: "500" }}
          >
            {value}
          </MDTypography>
        )}
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of DefaultInfoCard
DefaultInfoCard.defaultProps = {
  color: "info",
  value: "",
  description: "",
};

// Typechecking props for the DefaultInfoCard
DefaultInfoCard.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
  ]),
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default DefaultInfoCard;
