import React from "react";
import { View } from "react-native";
import { Card, useTheme } from "react-native-paper";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "@/app/components/MDBox";
import MDTypography from "@/app/components/MDTypography";

// Timeline context
import { TimelineProvider } from "@/app/examples/Timeline/context";

function TimelineList({ title, dark, children }) {
  const theme = useTheme();

  return (
    <TimelineProvider value={dark}>
      <Card style={{ margin: 8 }}>
        <MDBox
          bgColor={dark ? "dark" : "white"}
          variant="gradient"
          borderRadius="xl"
          style={{
            backgroundColor: dark ? theme.colors.surface : theme.colors.surface,
            borderRadius: 16,
          }}
        >
          <MDBox
            pt={3}
            px={3}
            style={{ paddingTop: 24, paddingHorizontal: 24 }}
          >
            <MDTypography
              variant="h6"
              fontWeight="medium"
              color={dark ? "white" : "dark"}
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: dark ? "white" : theme.colors.onSurface,
              }}
            >
              {title}
            </MDTypography>
          </MDBox>
          <MDBox p={2} style={{ padding: 16 }}>
            {children}
          </MDBox>
        </MDBox>
      </Card>
    </TimelineProvider>
  );
}

// Setting default values for the props of TimelineList
TimelineList.defaultProps = {
  dark: false,
};

// Typechecking props for the TimelineList
TimelineList.propTypes = {
  title: PropTypes.string.isRequired,
  dark: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default TimelineList;
