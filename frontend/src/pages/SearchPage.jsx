import { useState, useEffect } from 'react';
import '../styles/SearchPage.css';
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { FaAmazon, FaSearch, FaStar, FaBookmark, FaRedo, FaBalanceScale } from "react-icons/fa";

const SearchPage = () => {
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [analyzedProducts, setAnalyzedProducts] = useState([]);
  const [productRatings, setProductRatings] = useState({});
  const [savedProducts, setSavedProducts] = useState([]);




  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productReviews"));
        const reviewsData = querySnapshot.docs.map((doc) => doc.data());
        setReviews(reviewsData); // Update the state with fetched reviews
      } catch (error) {
        console.error("Error fetching reviews from Firestore:", error);
      }
    };

    fetchProducts();
  }, []);

  // const response = await fetch("http://127.0.0.1:8082/saveproduct", {
  // const response = await fetch("https://sentimentor-productcomparator-116de15a416a.herokuapp.com/saveproduct", {
  const saveProduct = async (product) => {
    try {
        const response = await fetch("https://sentimentor-productcomparator-116de15a416a.herokuapp.com/saveproduct", {
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
    setIsSearching(true);
    const filtered = reviews.filter((review) =>
      review.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredReviews(filtered);
  };

  // fetch(`http://127.0.0.1:8081/sentimentanalyzer?name=${encodeURIComponent(productName)}`)
  // fetch(`https://sentimentor-sentimentanalyzer-f8043a0ff5c9.herokuapp.com/sentimentanalyzer?name=${encodeURIComponent(productName)}`)
  const analyzeReview = (productName) => {
    fetch(`https://sentimentor-sentimentanalyzer-f8043a0ff5c9.herokuapp.com/sentimentanalyzer?name=${encodeURIComponent(productName)}`)
      .then((response) => response.json())
      .then((json) => {
        console.log("Analyzed Product:", json);
        setReviewData(json);
        setAnalyzedProducts((prev) => [...prev, productName]);
        setProductRatings((prev) => ({
          ...prev,
          [productName]: json.analysisContent.sentimentRating,
        }));
      });
  };


  return (
    <div className="appcontainer">
      <div className="reviewsContainer">
        <div className="searchContainer">
          <div className="searchBar">
            <input
              type="text"
              placeholder="Search for a product... "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="searchInput"
            />
            <button onClick={handleSearch} className="searchButton">
              <FaSearch className="searchIcon" />
            </button>
          </div>
          {isSearching && (
            <div className="productList">
              {filteredReviews.length > 0 ? (
                <ul>
                  {filteredReviews.map((review, index) => (
                    <li key={index} className="productItem">
                      {review.image && (
                        <img
                          src={review.image}
                          alt={review.name}
                          className="reviewImage"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="productInfoContainer">
                        <div className="productNameWithBookmark">
                          <h3 className="productName">{review.name}</h3>
                          <FaBookmark
                            className={`bookmarkIcon ${savedProducts.includes(review.name) ? "saved" : ""}`}
                            onClick={() => saveProduct(review)}
                            title="Save Product"
                          />
                          <FaRedo
                            className="actionIcon"
                            onClick={() => analyzeReview(review.name)}
                            title="Reanalyze Product"
                          />
                          <FaBalanceScale
                            className="actionIcon"
                            onClick={() => console.log("Compare", review.name)}
                            title="Compare Product"
                          />
                        </div>
                        <div className="productActions">
                          <button
                            className="analyzeButton"
                            onClick={() => analyzeReview(review.name)}
                            disabled={analyzedProducts.includes(review.name)}
                          >
                            {analyzedProducts.includes(review.name) ? "Analyzed" : "Analyze"}
                          </button>
                          {analyzedProducts.includes(review.name) ? (
                            <div className="inlineRating">
                              <span className="reviewSources">Rating ➝</span>
                              <div className="starRating">
                                <div className="analyzedStars">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar
                                      key={i}
                                      className={`star ${i < Math.round(productRatings[review.name] || 0) ? "filledStar" : ""}`}
                                      style={{ fontSize: "18px", marginRight: "2px" }}
                                    />
                                  ))}
                                  <div className="analyzedRating">
                                    {productRatings[review.name]}/5.00
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="reviewSources">Reviews ➝</span>
                              {review.links.map((link, linkIndex) => (
                                <a
                                  key={linkIndex}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="reviewLinkButton"
                                >
                                  {linkIndex + 1}
                                </a>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </li>

                  ))}
                </ul>
              ) : (
                <p>No reviews found.</p>
              )}
            </div>
          )}
        </div>
        <div className="analysisContainer">
          {reviewData && (
            <div>
              <div className="productDetails">
                <div className="imageContainer">
                  <img src={reviewData.image} alt={reviewData.name} className="reviewImageAnalysis" referrerPolicy="no-referrer" />
                </div>

                <div className="productInfo">
                  <h2 className="productTitle">{reviewData.analysisContent.name}</h2>
                  <p className="productSummary"><strong>Summary:</strong> {reviewData.analysisContent.summary}</p>
                </div>

                <div className="priceInfo">
                  <h2 className="priceText">
                    Price: <span className="priceNumber">{reviewData.analysisContent.price}</span>
                  </h2>
                  <p className="source"> (Source: {reviewData.analysisContent.priceSource})</p>
                  {reviewData.amazonLink && (
                    <a href={reviewData.amazonLink} target="_blank" rel="noopener noreferrer" className="amazonButton">
                      <FaAmazon className="amazonIcon" />
                      Buy on Amazon
                    </a>
                  )}
                </div>
              </div>
              <div className="sentimentRating">
                <h3 className="ratingHeader">Overall Sentiment Rating</h3>

                <div className="starRating">
                  {[...Array(5)].map((_, index) => (
                    <FaStar key={index} className={index < Math.round(reviewData.analysisContent.sentimentRating) ? "star filledStar" : "star"} />
                  ))}
                </div>

                <div className="sentimentBadgeContainer">
                  <p className={`sentimentBadge ${reviewData.analysisContent.sentiment.toLowerCase()}`}>
                    {reviewData.analysisContent.sentimentRating}/5.00 - {reviewData.analysisContent.sentiment}
                  </p>
                  <div className="tooltip">
                    <span className="tooltipTrigger">What do these scores mean?</span>
                    <span className="tooltipText">
                      <strong>Sentiment Score Meaning:</strong><br />
                      <strong>0.00 - 1.00:</strong> Highly Negative 😡<br />
                      <strong>1.00 - 2.00:</strong> Negative 🙁<br />
                      <strong>2.00 - 3.00:</strong> Neutral 😐<br />
                      <strong>3.00 - 4.00:</strong> Positive 🙂<br />
                      <strong>4.00 - 5.00:</strong> Highly Positive 😍
                    </span>
                  </div>
                </div>
              </div>

              <div className="sentimentBreakdown">
                <h3 className="breakdownHeader" >Sentiment Breakdown by Category</h3>
                <div className="sentimentGrid">
                  <div className="sentimentItem"><strong>Value for Money:</strong> {reviewData.analysisContent.valueForMoney}</div>
                  <div className="sentimentItem"><strong>Sound Quality:</strong> {reviewData.analysisContent.soundQuality}</div>
                  <div className="sentimentItem"><strong>Comfort & Fit:</strong> {reviewData.analysisContent.comfortFit}</div>
                  <div className="sentimentItem"><strong>Battery Life & Charging:</strong> {reviewData.analysisContent.batteryLife}</div>
                  <div className="sentimentItem"><strong>Connectivity:</strong> {reviewData.analysisContent.connectivity}</div>
                  <div className="sentimentItem"><strong>Features & Controls:</strong> {reviewData.analysisContent.featuresControls}</div>
                  <div className="sentimentItem"><strong>Call Quality:</strong> {reviewData.analysisContent.callQuality}</div>
                  <div className="sentimentItem"><strong>Brand & Warranty:</strong> {reviewData.analysisContent.brandWarranty}</div>
                  <div className="sentimentItem"><strong>Reviews & User Feedback:</strong> {reviewData.analysisContent.userFeedback}</div>
                  <div className="sentimentItem"><strong>Availability:</strong> {reviewData.analysisContent.availability}</div>
                </div>
              </div>

              <button onClick={() => saveProduct(reviewData)} className="saveButton">
                Save Product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
