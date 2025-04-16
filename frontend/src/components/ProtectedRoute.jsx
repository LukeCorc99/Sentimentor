import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';

// Used to protect routes that require authentication.
const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication state.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuth(!!user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * PropTypes validation ensures that the `children` prop is properly passed to the component.
 * - ESLint rules require that props are validated.
 * - Helps prevent missing or invalid `children` props.
 * - `children` is essential to render content for authenticated users.
 */
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
