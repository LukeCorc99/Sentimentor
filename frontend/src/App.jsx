import React, { useState, useEffect } from 'react';
import './App.css'; // Import the CSS file for styling

// Main component for the Review Collector App
const App = () => {
  // State for storing all reviews fetched from a JSON file or backend
  const [reviews, setReviews] = useState([]);
  // State for storing the current search query entered by the user
  const [searchQuery, setSearchQuery] = useState('');
  // State for storing the filtered reviews based on the search query
  const [filteredReviews, setFilteredReviews] = useState([]);
  // State to indicate if a search has been performed
  const [isSearching, setIsSearching] = useState(false);


  // Fetch reviews when the component starts
  useEffect(() => {
    // Fetch reviews from the JSON file or backend API
    fetch('/camerareviews.json')
      .then((response) => response.json()) // Parse the JSON response
      .then((data) => {
        setReviews(data); // Update the reviews state with fetched data
      })
      .catch((error) => console.error('Error fetching reviews:', error)); // Log any errors
  }, []); // Empty dependency array ensures this runs only once when the component mounts


  // Function to handle the Search button click
  const handleSearch = () => {
    setIsSearching(true); // Indicate that a search has been performed
    // Filter reviews by checking if the review name contains the search query
    const filtered = reviews.filter((review) =>
      review.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredReviews(filtered); // Update the filtered reviews state
  };

  // Function to analyze the sentiment of a review
  const analyzeReview = (cameraName) => {
    // Call the sentimentanalyzer microservice
    fetch(`http://127.0.0.1:8081/sentimentanalyzer?name=${encodeURIComponent(cameraName)}`)
      .then((response) => response.json())
      .then((json) => console.log(json)) // For debugging purposes
  };

  return (
    <div className="appcontainer">
      <h1>Review Collector</h1>
      {/* Search Bar and Button */}
      <div>
        <input
          type="text"
          placeholder="Search for a product..." // Placeholder text for the search bar
          value={searchQuery} // Bind input value to searchQuery state
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query state on input change
          className="searchinput"
        />
        <button
          onClick={handleSearch} // Trigger search when button is clicked
          className="searchbutton"
        >
          Search
        </button>
      </div>

      {/* Display filtered reviews or a message if no results are found */}
      {isSearching && (
        <div>
          {/* If there are filtered reviews, display them in a list */}
          {filteredReviews.length > 0 ? (
            <ul>
              {filteredReviews.map((review, index) => ( // Map over the filtered reviews and display them
                <li key={index} className="reviewlink">
                  <h3>{review.name}</h3>
                  <button
                    button onClick={() => analyzeReview(review.name)} // Aanalyze the sentiment of the review on button click
                    className="analyzebutton"
                  >Analyze
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            // Display a message if no results match the search query
            <p>No results found.</p>
          )}
        </div>
      )}
      
    </div>
  );
};

export default App;
