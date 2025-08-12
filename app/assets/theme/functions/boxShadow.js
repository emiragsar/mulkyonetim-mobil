/**
=========================================================
* Material Dashboard 2 React Native - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/**
  The boxShadow() function helps you to create a box shadow for an element
  For React Native, we return an object with shadow properties
 */

// Material Dashboard 2 React Native helper functions
import rgba from "./rgba";
import pxToRem from "./pxToRem";

function boxShadow(offset = [], radius = [], color, opacity, inset = "") {
  const [x, y] = offset;
  const [blur, spread] = radius;

  // For React Native, return shadow object instead of CSS string
  return {
    shadowOffset: {
      width: pxToRem(x),
      height: pxToRem(y),
    },
    shadowRadius: pxToRem(blur),
    shadowColor: rgba(color, opacity),
    shadowOpacity: opacity,
    elevation: pxToRem(blur), // For Android
  };
}

export default boxShadow; 