import { useState, useEffect } from 'react';
import '../styles/SearchPage.css';
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  getDocs
} from 'firebase/firestore'
import { FaSearch, FaStar, FaStarHalfAlt, FaRegStar, FaPowerOff } from "react-icons/fa";
import WelcomeMessage from '../components/WelcomeMessage';
import AnalysisSection from '../components/AnalysisSection';
import ComparisonSection from '../components/ComparisonSection';
import LoadingScreen from '../components/LoadingScreen';
import { getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

// Main screen. Interface that allows the searching of products, analyzing of reviews and comparison of products
const SearchPage = () => {
  // State management for product reviews and search functionality
  const [reviews, setReviews] = useState([]); // All product reviews from the database
  const [searchQuery, setSearchQuery] = useState(''); // Current search input
  const [filteredReviews, setFilteredReviews] = useState([]); // Reviews filtered by search term
  const [isSearching, setIsSearching] = useState(false); // Controls search UI visibility
  
  // State for analysis and product data
  const [reviewData, setReviewData] = useState(null); // Currently selected product analysis data
  const [analyzedProducts, setAnalyzedProducts] = useState([]); // Track which products have been analyzed
  const [productRatings, setProductRatings] = useState({}); // Store sentiment ratings by product name
  const [savedProducts, setSavedProducts] = useState([]); // User's saved products from Firestore
  
  // UI interaction states
  const [hoveredButton, setHoveredButton] = useState(null); // Track which button is being hovered
  const [analyzingProduct, setAnalyzingProduct] = useState(null); // Currently analyzing product name
  const [analyzingDots, setAnalyzingDots] = useState(""); // Loading animation dots
  const [expandedCategories, setExpandedCategories] = useState({}); // Track which categories are expanded
  const [animationKey, setAnimationKey] = useState(0); // Key for triggering animations
  
  // Comparison feature states
  const [comparisonProducts, setComparisonProducts] = useState([]); // Products being compared
  const [showComparison, setShowComparison] = useState(false); // Toggle comparison view
  
  // Firebase authentication and navigation
  const auth = getAuth();
  const navigate = useNavigate();

  // Color palette for comparison charts
  const colorPalette = [
    "rgba(250, 96, 130, 0.8)",
    "rgba(0, 153, 255, 0.8)",
    "rgba(255, 206, 86, 0.8)",
    "rgba(153, 102, 255, 0.8)"
  ];

  // Fetch all product reviews from Firestore when application loads
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "productReviews"))
      const reviewsData = querySnapshot.docs.map((doc) => doc.data())

      setReviews(reviewsData)
    }
    fetchProducts()
  }, [])


  // Fetch user's saved products from Firestore when user is authenticated
  useEffect(() => {
    const user = auth.currentUser

    const fetchSavedProducts = async () => {
      const userDocRef = doc(db, 'users', user.uid)
      const savedCollRef = collection(userDocRef, 'savedProducts')
      const savedDocs = await getDocs(savedCollRef)

      // Map through the documents, preserving the document ID as well as the data
      const saved = savedDocs.docs.map(doc => ({
        id: doc.id, // Include the Firestore document ID
        ...doc.data() // Spread in all the document fields
      }))
      setSavedProducts(saved)
    }

    fetchSavedProducts()
  }, [auth.currentUser])


  // Set the filtered reviews when the number of reviews change
  useEffect(() => {
    if (reviews.length > 0) {
      setIsSearching(true);
      setFilteredReviews(reviews);
    }
  }, [reviews]);


  // Set the loading animation dots when a product is being analyzed
  useEffect(() => {
    if (analyzingProduct !== null) {
      const intervalId = setInterval(() => {
        setAnalyzingDots((currentDots) => (currentDots.length < 3 ? currentDots + "." : "")); // Cycle through dots
      }, 500);
      return () => clearInterval(intervalId);
    } else {
      setAnalyzingDots(""); // Reset dots when not analyzing
    }
  }, [analyzingProduct]);


  // Scroll to the top of the page when the analysis screen displays
  useEffect(() => {
    if (reviewData) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [reviewData]);

  // Search function to filter reviews based on the user's input
  const search = () => {
    setIsSearching(true);
    setAnimationKey(currentKey => currentKey + 1); // Trigger animation by changing key

    // Find reviews based on the search query, case insensitive
    const filtered = reviews.filter((review) =>
      review.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredReviews(filtered);
  };

  // Analyze a product using the sentiment analysis API
  const analyzeProduct = (productName) => {
    setAnalyzingProduct(productName);

    // fetch(`http://127.0.0.1:8081/sentimentanalyzer?name=${encodeURIComponent(productName)}`)
    // fetch(`https://sentimentor-sentimentanalyzer-f8043a0ff5c9.herokuapp.com/sentimentanalyzer?name=${encodeURIComponent(productName)}`)
    fetch(`https://sentimentor-sentimentanalyzer-f8043a0ff5c9.herokuapp.com/sentimentanalyzer?name=${encodeURIComponent(productName)}`)
      .then((response) => response.json())
      .then((json) => {
        console.log("Analyzed Product:", json);
        setReviewData(json);
        setAnalyzedProducts((currentProducts) => [...currentProducts, productName]); // Add product to analyzed list

        // Set the product rating based on the analysis result
        setProductRatings((currentRatings) => ({
          ...currentRatings,
          [productName]: json.analysisContent.sentimentRating,
        }));
        setAnalyzingProduct(null);
        setShowComparison(false);
      });
  };


  // Revert the analysis of a product
  const revertAnalyze = (productName) => {
    setAnalyzedProducts((previousAnalysis) => previousAnalysis.filter((name) => name !== productName)); // Remove product from analyzed list

    // Remove the product rating from the state
    setProductRatings((previousRating) => {
      const updated = {...previousRating}; // Create a copy of the previous ratings object
      delete updated[productName];
      return updated;
    });

    // Reset the review data if the analyzed product is the same as the current review data
    if (reviewData && reviewData.analysisContent.name === productName) {
      setReviewData(null);
    }
  };


  // Toggle the expansion of categories in the analysis section
  const toggleCategory = (category) => {
    setExpandedCategories(currentState => {
      const updatedState = { ...currentState };
      // If category exists and is true, set to false. Otherwise, set to true
      updatedState[category] = currentState[category] ? false : true;
      return updatedState;
    });
  };


  // Sign out the user and navigate to the login page
  const signOut = async () => {
    await auth.signOut();
    navigate('/login');
  };


  // Transform analysis data to a format suitable for comparison. Uses fallback values if data is missing to avoid crashing
  const transformAnalysisToComparison = (analysisData) => {
    return {
      id: `analysis-${analysisData.analysisContent.name}`,
      name: analysisData.analysisContent.name,
      image: analysisData.image,
      rating: analysisData.analysisContent.sentimentRating || 0,
      price: analysisData.analysisContent.price || "",
      amazonLink: analysisData.amazonLink || "",
      categories: {
        "Sound Quality": analysisData.analysisContent.soundQualityRating,
        "Comfort & Fit": analysisData.analysisContent.comfortFitRating,
        "Battery Life": analysisData.analysisContent.batteryLifeRating,
        "Value": analysisData.analysisContent.valueForMoneyRating,
        "Connectivity": analysisData.analysisContent.connectivityRating,
        "Brand & Warranty": analysisData.analysisContent.brandWarrantyRating,
        "User Feedback": analysisData.analysisContent.userFeedbackRating,
        "Availability": analysisData.analysisContent.availabilityRating,
      }
    };
  };


  // Transform saved product data to a format suitable for comparison. Uses fallback values if data is missing to avoid crashing
  const transformSavedToComparison = (saved) => {
    const a = saved.analysisContent || {};

    return {
      id: saved.id,
      name: saved.name || a.name || "",
      image: saved.image || a.image || "",
      rating: a.sentimentRating || 3.0,

      price: a.price || "",
      amazonLink: saved.amazonLink || a.amazonLink || "",

      categories: {
        "Sound Quality": a.soundQualityRating || 3.0,
        "Comfort & Fit": a.comfortFitRating || 3.0,
        "Battery Life": a.batteryLifeRating || 3.0,
        "Value": a.valueForMoneyRating || 3.0,
        "Connectivity": a.connectivityRating || 3.0,
        "Brand & Warranty": a.brandWarrantyRating || 3.0,
        "User Feedback": a.userFeedbackRating || 3.0,
        "Availability": a.availabilityRating || 3.0,
      },
    };
  };


  // Handle the comparison of products. Transforms the analysis data and saved products to a comparison format, colors them, and sets them in state
  const compareNow = (selectedSavedProducts, analysisData) => {
    // Transform the current analysis data into the comparison format
    const currentAnalysisProduct = transformAnalysisToComparison(analysisData);

    // Transform each selected saved product into the comparison format
    const transformedSaved = selectedSavedProducts.map(transformSavedToComparison);

    // Combine the current product with saved products. The current product always appears first in the comparison
    const productsToCompare = [currentAnalysisProduct, ...transformedSaved];

    // Assign colors to each product for visual identification in charts
    const coloredProducts = productsToCompare.map((product, index) => ({
      ...product,
      color: colorPalette[index]
    }));
    setComparisonProducts(coloredProducts);
    setShowComparison(true);
  };



  return (
    <div className="appcontainer">
      <div className="reviewsContainer">
        <div className="searchContainer">
          <div className="searchBar">
            <input
              type="text"
              placeholder="Search for a product to analyze... "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="searchInput"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  search();
                }
              }}
            />
            <button onClick={search} className="searchButton">
              <FaSearch className="searchIcon" />
            </button>
          </div>
          {isSearching && (
            <div className="productList" key={animationKey}>
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
                                analyzeProduct(review.name);
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
                              <span className="reviewSourceText">Rating ➝</span>
                              <div className="analyzedStars">
                                {[...Array(5)].map((_, index) => {
                                  const starNumber = index + 1;
                                  const rating = productRatings[review.name] || 0;
                                  if (rating >= starNumber) {
                                    return (
                                      <FaStar
                                        key={index}
                                        className="starAnalyzed filledStarAnalyzed"
                                      />
                                    );
                                  } else if (rating >= starNumber - 0.5) {
                                    return (
                                      <FaStarHalfAlt
                                        key={index}
                                        className="starAnalyzed halfStarAnalyzed"
                                      />
                                    );
                                  } else {
                                    return (
                                      <FaRegStar
                                        key={index}
                                        className="starAnalyzed emptyStarAnalyzed"
                                      />
                                    );
                                  }
                                })}
                                <div className="analyzedRating">
                                  {productRatings[review.name]}/5.00
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="reviewSourceText">Reviews ➝</span>
                              <div className="reviewSources">
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
                              </div>
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
          {showComparison ? (
            <ComparisonSection
              products={comparisonProducts}
              onBack={() => setShowComparison(false)}
            />
          ) : analyzingProduct !== null ? (
            <LoadingScreen />
          ) : reviewData ? (
            <AnalysisSection
              reviewData={reviewData}
              expandedCategories={expandedCategories}
              toggleCategory={toggleCategory}
              savedProducts={savedProducts}
              setSavedProducts={setSavedProducts}
              onCompare={compareNow}
            />
          ) : (
            <WelcomeMessage />
          )}
        </div>
      </div>

      <button className="signoutBtn" onClick={signOut}>
        <FaPowerOff />
        <span>Sign Out</span>
      </button>
    </div>
  )
}


export default SearchPage;
