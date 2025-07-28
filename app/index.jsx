// app/index.jsx
import { Redirect } from "expo-router";
import React from "react";

const AppEntry = () => {
  // Direkt ana uygulamaya yönlendir
  return <Redirect href="/layouts/" />;
};

export default AppEntry;
