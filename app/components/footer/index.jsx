/**
 * =========================================================
 * Material Dashboard 2 React Native - Footer Component
 * =========================================================
 *
 * React Native version of the Footer component
 * Converted from Material Dashboard 2 React
 */

import PropTypes from "prop-types";
import React from "react";
import {
  Dimensions,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const Footer = (props = {}) => {
  const {
    company = Footer.defaultProps.company,
    links = Footer.defaultProps.links,
  } = props;
  const { href, name } = company;

  const handleLinkPress = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    } catch (error) {
      console.error("An error occurred", error);
    }
  };

  const renderLinks = () =>
    links.map((link, index) => (
      <TouchableOpacity
        key={link.name}
        style={styles.linkItem}
        onPress={() => handleLinkPress(link.href)}
        activeOpacity={0.7}
      >
        <Text style={styles.linkText}>{link.name}</Text>
      </TouchableOpacity>
    ));

  return (
    <View style={styles.container}>
      <View style={styles.copyrightContainer}>
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()},{" "}
          <TouchableOpacity
            onPress={() => handleLinkPress(href)}
            activeOpacity={0.7}
          >
            <Text style={styles.companyName}>{name}</Text>
          </TouchableOpacity>{" "}
          tarafından akıllı mülk yönetimi için oluşturuldu
        </Text>
      </View>

      <View style={styles.linksContainer}>{renderLinks()}</View>
    </View>
  );
};

// Default props
Footer.defaultProps = {
  company: {
    href: "https://www.rbitbot.com/",
    name: "rbit Teknoloji",
  },
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

// PropTypes
Footer.propTypes = {
  company: PropTypes.shape({
    href: PropTypes.string,
    name: PropTypes.string,
  }),
  links: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string,
      name: PropTypes.string,
    })
  ),
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: width > 768 ? "row" : "column",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  copyrightContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    marginBottom: width > 768 ? 0 : 16,
  },
  copyrightText: {
    fontSize: 14,
    color: "#7b809a",
    textAlign: "center",
    lineHeight: 20,
  },
  companyName: {
    fontSize: 14,
    color: "#344767",
    fontWeight: "500",
  },
  linksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    marginTop: width > 768 ? 0 : 12,
  },
  linkItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  linkText: {
    fontSize: 14,
    color: "#7b809a",
    fontWeight: "400",
  },
});

export default Footer;
