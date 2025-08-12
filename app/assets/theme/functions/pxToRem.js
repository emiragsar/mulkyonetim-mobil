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
  The pxToRem() function helps you to convert a px unit into a rem unit, 
  but for React Native we'll return the number directly since React Native uses numbers for fontSize
 */

function pxToRem(number, baseNumber = 16) {
  // For React Native, we return the number directly since fontSize expects numbers
  return number;
}

export default pxToRem; 