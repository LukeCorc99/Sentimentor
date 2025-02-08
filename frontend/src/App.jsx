import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SearchPage from './pages/SearchPage';
import SavedProductsPage from './pages/SavedProductsPage';
import ProductComparatorPage from './pages/ProductComparatorPage';
import ProtectedRoute from './components/ProtectedRoute';
import NavBar from './components/NavBar';

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
                <NavBar />
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
                <NavBar />
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
                <NavBar />
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
