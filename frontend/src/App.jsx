import React, { useState, useEffect } from 'react';

const App = () => {
  const [reviews, setReviews] = useState([]); // State for all reviews
  const [searchQuery, setSearchQuery] = useState(''); // State for the search query
  const [filteredReviews, setFilteredReviews] = useState([]); // State for filtered reviews
  const [isSearching, setIsSearching] = useState(false); // State to track if a search has been performed

  useEffect(() => {
    // Fetch reviews from the JSON file or backend
    fetch('/camerareviews.json') // Adjust this URL to point to your JSON file
      .then((response) => response.json())
      .then((data) => {
        setReviews(data);
      })
      .catch((error) => console.error('Error fetching reviews:', error));
  }, []);

  // Handle the search button click
  const handleSearch = () => {
    setIsSearching(true); // Mark that a search has been performed
    const filtered = reviews.filter((review) =>
      review.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredReviews(filtered);
  };

  return (
    <div>
      <h1>Review Collector</h1>
      {/* Search Bar and Button */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search for a name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query on input
          style={{
            width: '50%',
            padding: '12px',
            fontSize: '18px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            marginLeft: '10px',
            padding: '12px 20px',
            fontSize: '18px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#007BFF',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </div>

      {/* Display the filtered reviews */}
      {isSearching && (
        <div>
          {filteredReviews.length > 0 ? (
            <ul>
              {filteredReviews.map((review, index) => (
                <li key={index}>
                  <h3>{review.name}</h3>
                  <a href={review.link} target="_blank" rel="noopener noreferrer">
                    {review.link}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No results found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
