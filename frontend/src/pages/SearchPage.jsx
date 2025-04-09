import { useState, useEffect } from 'react';
import '../styles/SearchPage.css';
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  getDocs
} from 'firebase/firestore'
import { FaSearch, FaStar, FaBookmark, FaPowerOff } from "react-icons/fa";
import WelcomeMessage from '../components/WelcomeMessage';
import AnalysisSection from '../components/AnalysisSection';
import ComparisonSection from '../components/ComparisonSection';
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



  // const response = await fetch("http://127.0.0.1:8082/saveproduct", {
  // const response = await fetch("https://sentimentor-productcomparator-116de15a416a.herokuapp.com/saveproduct", {
  const saveProduct = async (product) => {
    try {
      const user = getAuth().currentUser
      if (!user) {
        console.error("No user is signed in, cannot save.")
        return
      }

      const dataToSend = { ...product, userId: user.uid }
      const response = await fetch("http://127.0.0.1:8082/saveproduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      const data = await response.json()
      if (response.ok) {
        console.log("Product saved successfully:", data.message, "Doc ID:", data.docId)

        const newSavedProduct = {
          ...product,
          id: data.docId
        }

        setSavedProducts((prev) => [...prev, newSavedProduct])
      } else {
        console.error("Error saving product:", data.error)
      }
    } catch (error) {
      console.error("Network error:", error)
    }
  }

  const deleteProduct = async (docId) => {
    try {
      const user = getAuth().currentUser;
      if (!user) {
        console.error("No user is signed in, cannot delete.");
        return;
      }

      const response = await fetch("http://127.0.0.1:8082/deleteproduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: docId,
          userId: user.uid
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Product deleted successfully:", data.message);
        // Remove from local state
        setSavedProducts((prev) => prev.filter((p) => p.id !== docId));
      } else {
        console.error("Error deleting product:", data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };



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
    fetch(`http://127.0.0.1:8081/sentimentanalyzer?name=${encodeURIComponent(productName)}`)
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

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/login');
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
                      <div className="productActionsIcons">
                        <div className="tooltip">
                          <FaBookmark
                            className={`bookmarkIcon ${savedProducts.some((p) => p.name === review.name) ? "saved" : ""}`}
                            onClick={() => {
                              const productInSaved = savedProducts.find((p) => p.name === review.name);

                              if (!analyzedProducts.includes(review.name)) {
                                return;
                              }

                              if (productInSaved) {
                                deleteProduct(productInSaved.id);
                              } else {
                                saveProduct(review);
                              }
                            }}
                            style={{
                              cursor: analyzedProducts.includes(review.name) ? "pointer" : "not-allowed",
                              opacity: analyzedProducts.includes(review.name) ? 1 : 0.5
                            }}
                          />
                          <span className="tooltipTextButton">
                            {savedProducts.some((p) => p.name === review.name)
                              ? "Unsave"
                              : analyzedProducts.includes(review.name)
                                ? "Save"
                                : "Analyze first!"}
                          </span>

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
          {showComparison ? (
            <>
              <ComparisonSection 
                products={comparisonProducts} 
                onBack={() => setShowComparison(false)} 
              />
            </>
          ) : (
            reviewData ? (
              <AnalysisSection
                reviewData={reviewData}
                expandedCategories={expandedCategories}
                toggleCategory={toggleCategory}
                savedProducts={savedProducts}
                setSavedProducts={setSavedProducts}
                onCompare={(selectedIds) => {
                  const productsToCompare = savedProducts.filter((p) => selectedIds.includes(p.id));
                  setComparisonProducts(productsToCompare);
                  setShowComparison(true);
                }}
              />
            ) : (
              <WelcomeMessage />
            )
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
