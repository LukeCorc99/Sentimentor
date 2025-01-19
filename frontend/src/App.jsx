import React, { useState, useEffect } from 'react';
import './App.css'; // Import the CSS file for styling
import { db } from "./firebaseConfig"; // Adjust the path to your firebaseConfig.js
import { collection, getDocs } from "firebase/firestore"; // Firestore functions



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
  // State for storing the sentiment analysis data of a review
  const [reviewData, setReviewData] = useState(null);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch reviews from Firestore
        const querySnapshot = await getDocs(collection(db, "camerareviews"));
        const reviewsData = querySnapshot.docs.map((doc) => doc.data());
        setReviews(reviewsData); // Update the state with fetched reviews
      } catch (error) {
        console.error("Error fetching reviews from Firestore:", error);
      }
    };
  
    fetchProducts(); // Call the function to fetch data
  }, []); // Run only once when the component mounts
  

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
    // Call the Sentiment Analyzer microservice with the review name as a query parameter
    fetch(`http://127.0.0.1:8081/sentimentanalyzer?name=${encodeURIComponent(cameraName)}`)
      .then((response) => response.json())
      .then((json) => {
        console.log("Analyzed Product:", json); // Log the analyzed product for debugging
        setReviewData(json); // Update the reviewData state with the sentiment analysis data
      })
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
      <div>
        {reviewData && ( // Display the sentiment analysis result if it exists
          <div>
            {/* Display the name of the product review */}
            <h3>{reviewData.name}</h3>

            {/* Provide a link to the product, opening it in a new tab */}
            <a href={reviewData.link} target="_blank" rel="noopener noreferrer">
              View Product
            </a>

            {/* Display the sentiment analysis result if it exists */}
            {reviewData.analysisContent && (
              <div>
                <p><strong>Summary:</strong> {reviewData.analysisContent.summary}</p>
                <p><strong>Sentiment Score:</strong> {reviewData.analysisContent.score}</p>
                <p><strong>Pros:</strong></p>
                <ul>
                  {reviewData.analysisContent.pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
                <p><strong>Cons:</strong></p>
                <ul>
                  {reviewData.analysisContent.cons.map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
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
                    onClick={() => analyzeReview(review.name)} // Analyze the sentiment of the review on button click
                    className="analyzebutton"
                  >Analyze
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reviews found.</p>
          )}
        </div>

      )}
    </div>
  );
};

export default App;
