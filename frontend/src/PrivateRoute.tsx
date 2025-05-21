// src/PrivateRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute: React.FC = () => {
  const isAuthenticated = Boolean(localStorage.getItem("access"));

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
