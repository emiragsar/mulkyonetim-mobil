import React from "react";
import { View, Linking, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";

function Footer({ company, links }) {
  const theme = useTheme();
  const { href, name } = company;

  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  const renderLinks = () =>
    links.map((link) => (
      <MDBox
        key={link.name}
        component="li"
        px={2}
        lineHeight={1}
        style={{ paddingHorizontal: 8 }}
      >
        <TouchableOpacity onPress={() => handleLinkPress(link.href)}>
          <MDTypography
            variant="button"
            fontWeight="regular"
            color="text"
            style={{ fontSize: 12, color: theme.colors.onSurface }}
          >
            {link.name}
          </MDTypography>
        </TouchableOpacity>
      </MDBox>
    ));

  return (
    <MDBox
      width="100%"
      display="flex"
      flexDirection={{ xs: "column", lg: "row" }}
      justifyContent="space-between"
      alignItems="center"
      px={1.5}
      style={{
        width: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 16,
      }}
    >
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        color="text"
        fontSize={12}
        px={1.5}
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          color: theme.colors.onSurface,
          fontSize: 12,
          paddingHorizontal: 12,
          textAlign: "center",
        }}
      >
        <MDTypography style={{ fontSize: 12, color: theme.colors.onSurface }}>
          &copy; {new Date().getFullYear()},
        </MDTypography>
        <TouchableOpacity onPress={() => handleLinkPress(href)}>
          <MDTypography
            variant="button"
            fontWeight="medium"
            style={{
              fontSize: 12,
              fontWeight: "500",
              color: theme.colors.primary,
              marginHorizontal: 4,
            }}
          >
            &nbsp;{name}&nbsp;
          </MDTypography>
        </TouchableOpacity>
        <MDTypography style={{ fontSize: 12, color: theme.colors.onSurface }}>
          tarafından akıllı mülk yönetimi için oluşturuldu
        </MDTypography>
      </MDBox>
      <MDBox
        component="ul"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          listStyle: "none",
          marginTop: 12,
          marginBottom: 0,
          padding: 0,
        }}
      >
        {renderLinks()}
      </MDBox>
    </MDBox>
  );
}

// Setting default values for the props of Footer
Footer.defaultProps = {
  company: { href: "https://www.rbitbot.com/", name: "rbit Teknoloji" },
  links: [
    { href: "https://www.rbitbot.com/", name: "rbit Teknoloji" },
    { href: "https://www.rbitbot.com/aboutus_page", name: "Hakkımızda" },
    { href: "https://www.rbitbot.com/blog_page", name: "Blog" },
    {
      href: "https://www.rbitbot.com/static/PrivacyPolicy.pdf",
      name: "Gizlilik",
    },
  ],
};

// Typechecking props for the Footer
Footer.propTypes = {
  company: PropTypes.objectOf(PropTypes.string),
  links: PropTypes.arrayOf(PropTypes.object),
};

export default Footer;
