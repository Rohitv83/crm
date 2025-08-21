import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check if the authentication token exists in local storage
  const isAuthenticated = !!localStorage.getItem('authToken');

  // If user is authenticated, render the child component (e.g., Dashboard)
  // The <Outlet /> component is a placeholder for the actual page.
  // Otherwise, redirect them to the login page
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
