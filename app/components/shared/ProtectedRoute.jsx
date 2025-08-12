import React from "react";
import { useAuth } from "@/context/AuthContext";
import Unauthorized from "./Unauthorized";
import LoadingView from "./LoadingView";

const ProtectedRoute = ({ children, title }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingView />;
  }

  if (!isAuthenticated) {
    return <Unauthorized title={title || "Giriş Gerekli"} />;
  }

  if (!isAdmin) {
    return <Unauthorized title={title} />;
  }

  return children;
};

export default ProtectedRoute;
