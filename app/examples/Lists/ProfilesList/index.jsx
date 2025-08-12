import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Card, useTheme } from "react-native-paper";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";
import MDAvatar from "../../../components/MDAvatar";
import MDButton from "../../../components/MDButton";

function ProfilesList({ title, profiles, shadow, onActionPress }) {
  const theme = useTheme();

  const handleActionPress = (action) => {
    if (onActionPress) {
      onActionPress(action);
    }
  };

  const renderProfiles = profiles.map(
    ({ image, name, description, action }) => (
      <MDBox
        key={name}
        component="li"
        display="flex"
        alignItems="center"
        py={1}
        mb={1}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 4,
          marginBottom: 4,
        }}
      >
        <MDBox mr={2} style={{ marginRight: 8 }}>
          <MDAvatar src={image} alt="something here" shadow="md" size="sm" />
        </MDBox>
        <MDBox
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="center"
          style={{
            flex: 1,
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <MDTypography
            variant="button"
            fontWeight="medium"
            style={{ fontSize: 14, fontWeight: "500" }}
          >
            {name}
          </MDTypography>
          <MDTypography
            variant="caption"
            color="text"
            style={{ fontSize: 12, color: theme.colors.onSurface }}
          >
            {description}
          </MDTypography>
        </MDBox>
        <MDBox ml="auto" style={{ marginLeft: "auto" }}>
          <TouchableOpacity onPress={() => handleActionPress(action)}>
            <MDButton
              variant="text"
              color={action.color || "info"}
              style={{ minWidth: 0, paddingHorizontal: 8 }}
            >
              {action.label}
            </MDButton>
          </TouchableOpacity>
        </MDBox>
      </MDBox>
    )
  );

  return (
    <Card
      style={{
        height: "100%",
        shadowColor: shadow ? "#000" : "transparent",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: shadow ? 0.25 : 0,
        shadowRadius: shadow ? 3.84 : 0,
        elevation: shadow ? 5 : 0,
        margin: 8,
      }}
    >
      <MDBox pt={2} px={2} style={{ paddingTop: 16, paddingHorizontal: 16 }}>
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
      </MDBox>
      <MDBox p={2} style={{ padding: 16 }}>
        <MDBox
          component="ul"
          display="flex"
          flexDirection="column"
          p={0}
          m={0}
          style={{ flexDirection: "column", padding: 0, margin: 0 }}
        >
          {renderProfiles}
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Setting default props for the ProfilesList
ProfilesList.defaultProps = {
  shadow: true,
  onActionPress: null,
};

// Typechecking props for the ProfilesList
ProfilesList.propTypes = {
  title: PropTypes.string.isRequired,
  profiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  shadow: PropTypes.bool,
  onActionPress: PropTypes.func,
};

export default ProfilesList;
