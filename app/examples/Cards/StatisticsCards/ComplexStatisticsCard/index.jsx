import React from "react";
import { View } from "react-native";
import { Card, Divider, useTheme } from "react-native-paper";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";

function ComplexStatisticsCard({ color, title, count, percentage, icon }) {
  const theme = useTheme();

  return (
    <Card style={{ margin: 8 }}>
      <MDBox
        display="flex"
        justifyContent="space-between"
        pt={1}
        px={2}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 8,
          paddingHorizontal: 16,
        }}
      >
        <MDBox
          variant="gradient"
          bgColor={color}
          color={color === "light" ? "dark" : "white"}
          coloredShadow={color}
          borderRadius="xl"
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="4rem"
          height="4rem"
          mt={-3}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            justifyContent: "center",
            alignItems: "center",
            marginTop: -12,
            backgroundColor: theme.colors[color] || theme.colors.primary,
          }}
        >
          {icon}
        </MDBox>
        <MDBox
          textAlign="right"
          lineHeight={1.25}
          style={{ alignItems: "flex-end", flex: 1 }}
        >
          <MDTypography
            variant="button"
            fontWeight="light"
            color="text"
            style={{ fontSize: 12 }}
          >
            {title}
          </MDTypography>
          <MDTypography
            variant="h4"
            style={{ fontSize: 24, fontWeight: "bold" }}
          >
            {count}
          </MDTypography>
        </MDBox>
      </MDBox>
      <Divider />
      <MDBox pb={2} px={2} style={{ paddingBottom: 16, paddingHorizontal: 16 }}>
        <MDTypography
          component="p"
          variant="button"
          color="text"
          display="flex"
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <MDTypography
            component="span"
            variant="button"
            fontWeight="bold"
            color={percentage.color}
            style={{
              fontWeight: "bold",
              color: theme.colors[percentage.color],
            }}
          >
            {percentage.amount}
          </MDTypography>
          <MDTypography style={{ marginLeft: 4 }}>
            {" "}
            {percentage.label}
          </MDTypography>
        </MDTypography>
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of ComplexStatisticsCard
ComplexStatisticsCard.defaultProps = {
  color: "info",
  percentage: {
    color: "success",
    text: "",
    label: "",
  },
};

// Typechecking props for the ComplexStatisticsCard
ComplexStatisticsCard.propTypes = {
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
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  percentage: PropTypes.shape({
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "white",
    ]),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  }),
  icon: PropTypes.node.isRequired,
};

export default ComplexStatisticsCard;
