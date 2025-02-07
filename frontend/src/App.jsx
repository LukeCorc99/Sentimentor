// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SearchPage from './pages/SearchPage';
import SavedProductsPage from './pages/SavedProductsPage';
import ProductComparatorPage from './pages/ProductComparatorPage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <>
                <nav>
                  <Link to="/search">Home</Link> |{' '}
                  <Link to="/saved">Saved Products</Link> |{' '}
                  <Link to="/compare">Compare Products</Link>
                </nav>
                <SearchPage />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <>
                <nav>
                  <Link to="/search">Home</Link> |{' '}
                  <Link to="/saved">Saved Products</Link> |{' '}
                  <Link to="/compare">Compare Products</Link>
                </nav>
                <SavedProductsPage />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <>
                <nav>
                  <Link to="/search">Home</Link> |{' '}
                  <Link to="/saved">Saved Products</Link> |{' '}
                  <Link to="/compare">Compare Products</Link>
                </nav>
                <ProductComparatorPage />
              </>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
