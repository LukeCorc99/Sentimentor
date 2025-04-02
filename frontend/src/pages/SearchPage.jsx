import { useState, useEffect } from 'react';
import '../styles/SearchPage.css';
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { FaSearch, FaStar, FaBookmark, FaBalanceScale } from "react-icons/fa";
import WelcomeMessage from '../components/WelcomeMessage';
import AnalysisSection from '../components/AnalysisSection';


const SearchPage = () => {
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [analyzedProducts, setAnalyzedProducts] = useState([]);
  const [productRatings, setProductRatings] = useState({});
  const [savedProducts, setSavedProducts] = useState([]);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [analyzingProduct, setAnalyzingProduct] = useState(null);
  const [analyzingDots, setAnalyzingDots] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [compareDropdownVisible, setCompareDropdownVisible] = useState(null)



  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "productReviews"))
      const reviewsData = querySnapshot.docs.map((doc) => doc.data())
      setReviews(reviewsData)
    }

    const fetchSavedProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "savedproducts"))
      const saved = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      setSavedProducts(saved)
    }

    fetchProducts()
    fetchSavedProducts()
  }, [])

  useEffect(() => {
    if (reviews.length > 0) {
      setIsSearching(true);
      setFilteredReviews(reviews);
    }
  }, [reviews]);

  useEffect(() => {
    if (analyzingProduct !== null) {
      const intervalId = setInterval(() => {
        setAnalyzingDots((prev) => (prev.length < 3 ? prev + "." : ""));
      }, 500);
      return () => clearInterval(intervalId);
    } else {
      setAnalyzingDots("");
    }
  }, [analyzingProduct]);


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
        setAnalyzingProduct(null);
      });
  };


  const revertAnalyze = (productName) => {
    setAnalyzedProducts((prev) => prev.filter((name) => name !== productName));

    setProductRatings((prev) => {
      const updated = { ...prev };
      delete updated[productName];
      return updated;
    });

    if (reviewData && reviewData.analysisContent.name === productName) {
      setReviewData(null);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };



  return (
    <div className="appcontainer">
      <div className="reviewsContainer">
        <div className="searchContainer">
          <div className="searchBar">
            <input
              type="text"
              placeholder=" Search for a product... "
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
                      <div className="productActionsIcons">
                        <div className="tooltip">
                          <FaBookmark
                            className={`bookmarkIcon ${savedProducts.includes(review.name) ? "saved" : ""}`}
                            onClick={() => {
                              if (analyzedProducts.includes(review.name) && !savedProducts.includes(review.name)) {
                                saveProduct(review);
                                setSavedProducts((prev) => [...prev, review.name]);
                              }
                            }}
                            style={{
                              cursor: analyzedProducts.includes(review.name) ? "pointer" : "not-allowed",
                              opacity: analyzedProducts.includes(review.name) ? 1 : 0.5
                            }}
                          />
                          <span className="tooltipTextButton">
                            {savedProducts.includes(review.name)
                              ? "Saved!"
                              : analyzedProducts.includes(review.name)
                                ? "Save Product"
                                : "Analyze first!"}
                          </span>
                        </div>

                        <div className="tooltip compareWrapper">
                          <FaBalanceScale
                            className="actionIcon"
                            onClick={() => {
                              if (analyzedProducts.includes(review.name)) {
                                setCompareDropdownVisible(prev =>
                                  prev === review.name ? null : review.name
                                );
                              }
                            }}
                            style={{
                              cursor: analyzedProducts.includes(review.name) ? "pointer" : "not-allowed",
                              opacity: analyzedProducts.includes(review.name) ? 1 : 0.5
                            }}
                          />
                          <span className="tooltipTextButton">
                            {analyzedProducts.includes(review.name)
                              ? "Compare Product"
                              : "Analyze first!"}
                          </span>

                          {analyzedProducts.includes(review.name) &&
                            compareDropdownVisible === review.name &&
                            savedProducts.length > 1 && (
                              <div className="compareDropdown">
                                <p className="compareHeader">Compare with:</p>
                                <ul className="compareList">
                                  {savedProducts
                                    .filter(p => p.name !== review.name)
                                    .map((product, i) => (
                                      <li key={i} className="compareItem">
                                        {product.name}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}
                        </div>

                      </div>

                      <div className="productInfoContainer">
                        <h3 className="productName">{review.name}</h3>
                        <div className="productActions">
                          <button
                            className={`analyzeButton ${analyzedProducts.includes(review.name) ? "analyzedState" : ""}`}
                            onMouseEnter={() => setHoveredButton(review.name)}
                            onMouseLeave={() => setHoveredButton(null)}
                            onClick={() => {
                              if (analyzedProducts.includes(review.name)) {
                                revertAnalyze(review.name);
                              } else {
                                setAnalyzingProduct(review.name);
                                analyzeReview(review.name);
                              }
                            }}
                          >
                            {analyzingProduct === review.name
                              ? `Analyzing${analyzingDots}`
                              : analyzedProducts.includes(review.name)
                                ? (hoveredButton === review.name ? "Re-analyze?" : "Analyzed")
                                : "Analyze"}
                          </button>

                          {analyzedProducts.includes(review.name) ? (
                            <div className="inlineRating">
                              <span className="reviewSources">Rating ➝</span>
                                <div className="analyzedStars">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar
                                      key={i}
                                      className={`starPrevious ${i < Math.round(productRatings[review.name] || 0) ? "filledStarPrevious" : ""}`}
                                      style={{ fontSize: "25px", marginRight: "2px" }}
                                    />
                                  ))}
                                  <div className="analyzedRating">
                                    {productRatings[review.name]}/5.00
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
          {reviewData ? (
            <AnalysisSection
              reviewData={reviewData}
              expandedCategories={expandedCategories}
              toggleCategory={toggleCategory}
            />
          ) : (
            <WelcomeMessage />
          )}
        </div>
      </div>
    </div>
  )
}


export default SearchPage;
