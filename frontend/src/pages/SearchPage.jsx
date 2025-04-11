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
  const [animationKey, setAnimationKey] = useState(0);
  const [comparisonProducts, setComparisonProducts] = useState([]);
  const [showComparison, setShowComparison] = useState(false);


  const auth = getAuth();
  const navigate = useNavigate();

  const colorPalette = [
    "rgba(255, 99, 132, 0.8)",
    "rgba(0, 153, 255, 0.8)",
    "rgba(255, 206, 86, 0.8)",
    "rgba(153, 102, 255, 0.8)"
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "productReviews"))
      const reviewsData = querySnapshot.docs.map((doc) => doc.data())
      setReviews(reviewsData)
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    const user = auth.currentUser

    const fetchSavedProducts = async () => {
      const userDocRef = doc(db, 'users', user.uid)
      const savedCollRef = collection(userDocRef, 'savedProducts')
      const snapshot = await getDocs(savedCollRef)
      const saved = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setSavedProducts(saved)
    }

    fetchSavedProducts()
  }, [auth.currentUser])

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


  useEffect(() => {
    if (reviewData) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [reviewData]);


  const handleSearch = () => {
    setIsSearching(true);
    setAnimationKey(prev => prev + 1);

    const filtered = reviews.filter((review) =>
      review.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredReviews(filtered);
  };

  // fetch(`http://127.0.0.1:8081/sentimentanalyzer?name=${encodeURIComponent(productName)}`)
  // fetch(`https://sentimentor-sentimentanalyzer-f8043a0ff5c9.herokuapp.com/sentimentanalyzer?name=${encodeURIComponent(productName)}`)
  const analyzeReview = (productName) => {
    setAnalyzingProduct(productName);

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
        setShowComparison(false);
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

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/login');
  };

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


  const handleCompare = (selectedSavedProducts, analysisData) => {
    const currentAnalysisProduct = transformAnalysisToComparison(analysisData);
    const transformedSaved = selectedSavedProducts.map(transformSavedToComparison);
    const productsToCompare = [currentAnalysisProduct, ...transformedSaved];
    const coloredProducts = productsToCompare.map((product, index) => ({
      ...product,
      color: colorPalette[index % colorPalette.length]
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
                  handleSearch();
                }
              }}
            />
            <button onClick={handleSearch} className="searchButton">
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
              onCompare={handleCompare}
            />
          ) : (
            <WelcomeMessage />
          )}
        </div>
      </div>

      <button className="signoutBtn" onClick={handleSignOut}>
        <FaPowerOff />
        <span>Sign Out</span>
      </button>
    </div>
  )
}


export default SearchPage;
