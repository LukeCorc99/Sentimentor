import { useState, useEffect } from 'react';
import '../styles/SearchPage.css'; // Import the CSS file for styling
import { db } from "../firebaseConfig"; // Path to firebaseConfig.js
import { collection, getDocs } from "firebase/firestore"; // Firestore functions

// Search page component
const SearchPage = () => {
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
        const querySnapshot = await getDocs(collection(db, "productReviews"));
        const reviewsData = querySnapshot.docs.map((doc) => doc.data());
        setReviews(reviewsData); // Update the state with fetched reviews
      } catch (error) {
        console.error("Error fetching reviews from Firestore:", error);
      }
    };

    fetchProducts();
  }, []);

  const saveProduct = async (product) => {
    try {
      const response = await fetch("http://127.0.0.1:8082/saveproduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Product saved successfully:", data.message);
      } else {
        console.error("Error saving product:", data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const handleSearch = () => {
    setIsSearching(true); // Indicate that a search has been performed
    const filtered = reviews.filter((review) =>
      review.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredReviews(filtered);
  };

  const analyzeReview = (cameraName) => {
    fetch(`http://127.0.0.1:8081/sentimentanalyzer?name=${encodeURIComponent(cameraName)}`)
      .then((response) => response.json())
      .then((json) => {
        console.log("Analyzed Product:", json);
        setReviewData(json); // Update the reviewData state with the sentiment analysis data
      });
  };

  return (
    <div className="appcontainer">
      <h1>Sentimentor</h1>
      <div>
        <input
          type="text"
          placeholder="Search for a product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="searchinput"
        />
        <button onClick={handleSearch} className="searchbutton">
          Search
        </button>
      </div>
      <div>
        {reviewData && (
          <div>
            <h3>{reviewData.analysisContent.name}</h3>
            {reviewData.image && (
              <img
                src={reviewData.image}
                alt={reviewData.name}
                className="reviewimage"
                referrerPolicy="no-referrer"
              />
            )}

            {reviewData.links && reviewData.links.length > 0 && (
              <div>
                {reviewData.links.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginRight: "10px" }}
                  >
                    View Product Review {index + 1}
                  </a>
                ))}
              </div>
            )}

            {reviewData.analysisContent && (
              <div>
                <p><strong>Summary:</strong> {reviewData.analysisContent.summary}</p>
                <p><strong>Price:</strong> {reviewData.analysisContent.price} <strong>Source:</strong> {reviewData.analysisContent.priceSource} </p>
                {reviewData.amazonLink && (
                  <div>
                    <a
                      href={reviewData.amazonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buy on Amazon
                    </a>
                  </div>
                )}
                <h4>Specifications:</h4>
                <ul>
                  {reviewData.analysisContent.specifications.map((spec, index) => (
                    <li key={index}>{spec}</li>
                  ))}
                </ul>

                <div>
                  <p><strong>Overall Sentiment Rating:  </strong>
                    {reviewData.analysisContent.sentimentRating} - <strong> {reviewData.analysisContent.sentiment} </strong>
                  </p>


                  <h4>Sentiment Breakdown by Category:</h4>
                  <ul>
                    <li><strong>Value for Money:</strong> {reviewData.analysisContent.priceValue}</li>
                    <li><strong>Sound Quality:</strong> {reviewData.analysisContent.soundQuality}</li>
                    <li><strong>Comfort & Fit:</strong> {reviewData.analysisContent.comfortFit}</li>
                    <li><strong>Battery Life & Charging:</strong> {reviewData.analysisContent.batteryLife}</li>
                    <li><strong>Connectivity & Compatibility:</strong> {reviewData.analysisContent.connectivity}</li>
                    <li><strong>Features & Controls:</strong> {reviewData.analysisContent.featuresControls}</li>
                    <li><strong>Call Quality & Microphone Performance:</strong> {reviewData.analysisContent.callQuality}</li>
                    <li><strong>Brand & Warranty:</strong> {reviewData.analysisContent.brandWarranty}</li>
                    <li><strong>Reviews & User Feedback:</strong> {reviewData.analysisContent.userFeedback}</li>
                    <li><strong>Availability & Local Factors:</strong> {reviewData.analysisContent.availability}</li>
                  </ul>
                </div>

                <button onClick={() => saveProduct(reviewData)} className="analyzebutton">
                  Save
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isSearching && (
        <div>
          {filteredReviews.length > 0 ? (
            <ul>
              {filteredReviews.map((review, index) => (
                <li key={index} className="reviewlink">
                  {review.image && (
                    <img
                      src={review.image}
                      alt={review.name}
                      className="reviewimage"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <h3>{review.name}</h3>
                  <button
                    onClick={() => analyzeReview(review.name)}
                  >
                    Analyze
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

export default SearchPage;
