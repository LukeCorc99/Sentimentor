import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import SavedProductsPage from './pages/SavedProductsPage';

const App = () => {
  const saveProduct = (product) => {
    // Function to save product
    console.log('Save product:', product);
  };

  const analyzeReview = (reviewName) => {
    // Function to analyze review
    console.log('Analyze review:', reviewName);
  };

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/saved">Saved Products</Link>
      </nav>
      <Routes>
        <Route
          path="/"
          element={<SearchPage analyzeReview={analyzeReview} saveProduct={saveProduct} />}
        />
        <Route path="/saved" element={<SavedProductsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
