import React from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";

// Timeline context
import { useTimeline } from "../context";

function TimelineItem({ color, icon, title, dateTime, description, lastItem }) {
  const theme = useTheme();
  const isDark = useTimeline();

  const timelineItemStyle = {
    position: "relative",
    marginBottom: lastItem ? 0 : 12,
    paddingLeft: 32,
  };

  const iconStyle = {
    position: "absolute",
    top: "8%",
    left: 2,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors[color] || theme.colors.primary,
  };

  return (
    <MDBox position="relative" mb={3} style={timelineItemStyle}>
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgColor={color}
        color="white"
        width="2rem"
        height="2rem"
        borderRadius="50%"
        position="absolute"
        top="8%"
        left="2px"
        zIndex={2}
        style={iconStyle}
      >
        {icon}
      </MDBox>
      <MDBox
        ml={5.75}
        pt={description ? 0.7 : 0.5}
        lineHeight={0}
        maxWidth="30rem"
        style={{
          marginLeft: 46,
          paddingTop: description ? 6 : 4,
          lineHeight: 0,
          maxWidth: 300,
        }}
      >
        <MDTypography
          variant="button"
          fontWeight="medium"
          color={isDark ? "white" : "dark"}
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: isDark ? "white" : theme.colors.onSurface,
          }}
        >
          {title}
        </MDTypography>
        <MDBox mt={0.5} style={{ marginTop: 4 }}>
          <MDTypography
            variant="caption"
            color={isDark ? "secondary" : "text"}
            style={{
              fontSize: 12,
              color: isDark ? theme.colors.secondary : theme.colors.onSurface,
            }}
          >
            {dateTime}
          </MDTypography>
        </MDBox>
        <MDBox mt={2} mb={1.5} style={{ marginTop: 16, marginBottom: 12 }}>
          {description ? (
            <MDTypography
              variant="button"
              color={isDark ? "white" : "dark"}
              style={{
                fontSize: 14,
                color: isDark ? "white" : theme.colors.onSurface,
              }}
            >
              {description}
            </MDTypography>
          ) : null}
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

// Setting default values for the props of TimelineItem
TimelineItem.defaultProps = {
  color: "info",
  lastItem: false,
  description: "",
};

// Typechecking props for the TimelineItem
TimelineItem.propTypes = {
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
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  dateTime: PropTypes.string.isRequired,
  description: PropTypes.string,
  lastItem: PropTypes.bool,
};

export default TimelineItem;
