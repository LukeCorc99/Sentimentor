import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import SavedProductsPage from './pages/SavedProductsPage';
import ProductComparatorPage from './pages/ProductComparatorPage';

const App = () => {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/saved">Saved Products</Link> | <Link to="/compare">Compare Products</Link>
      </nav>
      <Routes>
        <Route
          path="/"
          element={<SearchPage />}
        />
        <Route path="/saved" element={<SavedProductsPage />} />
        <Route path="/compare" element={<ProductComparatorPage />} />
      </Routes>
    </Router>
  );
};

export default App;
