// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed. User:', user);
      setIsAuth(!!user);
    });
    return unsubscribe;
  }, []);

  if (isAuth === null) {
    return <div>Loading...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
