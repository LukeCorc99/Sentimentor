import { useState } from 'react'
import { FaAmazon, FaStar, FaStarHalfAlt, FaRegStar, FaExchangeAlt, FaTimes, FaBookmark } from "react-icons/fa";
import '../styles/AnalysisSection.css';
import PropTypes from 'prop-types';
import { getAuth } from 'firebase/auth'



function AnalysisSection({ reviewData, expandedCategories, toggleCategory, savedProducts = [], setSavedProducts, onCompare }) {
  const [showCompareTooltip, setShowCompareTooltip] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const isSaved = savedProducts.some(p => p.name === reviewData.analysisContent.name);
  const [hoveredSaveButton, setHoveredSaveButton] = useState(false);

  const handleCompareToggle = () => {
    setShowCompareTooltip((prev) => !prev);
  };

  const handleSave = async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) {
        console.error("No user is signed in, cannot save.");
        return;
      }
      const dataToSend = { ...reviewData, userId: user.uid };

      // const response = await fetch("http://127.0.0.1:8082/saveproduct", {
      // const response = await fetch("https://sentimentor-productcomparator-116de15a416a.herokuapp.com/saveproduct", {
      const response = await fetch("https://sentimentor-productcomparator-116de15a416a.herokuapp.com/saveproduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Product saved successfully:", data.message, "Doc ID:", data.docId);
        const newSavedProduct = { ...reviewData, id: data.docId };
        setSavedProducts(prev => [...prev, newSavedProduct]);
      } else {
        console.error("Error saving product:", data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const handleSaveToggle = () => {
    if (isSaved) {
      const savedProduct = savedProducts.find(p => p.name === reviewData.analysisContent.name);
      handleDeleteProduct(savedProduct.id);
    } else {
      handleSave();
    }
  };

  const handleCheckboxChange = (productId) => {
    const selectedProduct = savedProducts.find(prod => prod.id === productId);

    if (selectedProduct && selectedProduct.analysisContent &&
      reviewData.analysisContent &&
      selectedProduct.analysisContent.name === reviewData.analysisContent.name) {
      return;
    }

    setSelectedForCompare((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        if (prev.length < 3) {
          return [...prev, productId];
        } else {
          return prev;
        }
      }
    });
  };


  const handleCompareNow = () => {
    if (onCompare) {
      const selectedSavedProducts = savedProducts.filter(prod =>
        selectedForCompare.includes(prod.id)
      );
      onCompare(selectedSavedProducts, reviewData);
      setShowCompareTooltip(false);
    }
  };


  const handleDeleteProduct = async (productId) => {
    try {
      const user = getAuth().currentUser
      if (!user) {
        console.error("No user is signed in.")
        return
      }
      // const response = await fetch("http://127.0.0.1:8082/deleteproduct", {
      // const response = await fetch("https://sentimentor-productcomparator-116de15a416a.herokuapp.com/deleteproduct", {
      const response = await fetch("https://sentimentor-productcomparator-116de15a416a.herokuapp.com/deleteproduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          userId: user.uid,
        }),
      });

      const data = await response.json()
      if (response.ok) {
        console.log("Product deleted successfully:", data.message)
        setSelectedForCompare((prev) => prev.filter((id) => id !== productId))
        setSavedProducts((prev) => prev.filter((p) => p.id !== productId))
      } else {
        console.error("Error deleting product:", data.error)
      }
    } catch (error) {
      console.error("Network error:", error)
    }
  }

  const isCompareButtonDisabled = selectedForCompare.length === 0;

  return (
    <div className="analysis-container">
      <div className="analysisCard">
        <div className="analysisContent">
          <div className="analysisHeader">
            <div className="analysisHeaderInfo">
              <div>
                <img
                  src={reviewData.image}
                  alt={reviewData.name}
                  className="analysisImage"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="analysisSummary">
                <h1 className="analysisTitle">{reviewData.analysisContent.name}</h1>
                <p className="analysisSummaryText"><strong>Summary: </strong> {reviewData.analysisContent.summary}</p>
              </div>
            </div>
            <div className="priceContainer">
              <div className="analysisPrice">
                <span className="priceAmount">{reviewData.analysisContent.price}</span>
                <span className="priceSource">via {reviewData.analysisContent.priceSource}</span>
              </div>
              <div className="buttons">
                {reviewData.amazonLink && (
                  <>
                    <a
                      href={reviewData.amazonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="amazonBtn"
                    >
                      <FaAmazon />Search it on Amazon
                    </a>
                  </>
                )}
                <div className="compareBtnWrapper">
                  <button className="compareBtn" type="button" onClick={handleCompareToggle}>
                    <FaExchangeAlt /> Compare this Product
                  </button>

                  {showCompareTooltip && (
                    <div className="compareTooltip">
                      <h3>Select up to 3 Previously Saved Products to Compare With:</h3>
                      <div className="compareProductsContainer">
                        <ul>
                          {savedProducts.map((prod) => {
                            const isSelected = selectedForCompare.includes(prod.id);
                            const isSameProduct = prod.analysisContent && reviewData.analysisContent &&
                              prod.analysisContent.name === reviewData.analysisContent.name;

                            return (
                              <li
                                key={prod.id}
                                className={`compareProductItem ${isSelected ? 'selected' : ''} ${isSameProduct ? 'disabled' : ''}`}
                                onClick={() => !isSameProduct && handleCheckboxChange(prod.id)}
                              >
                                {prod.image && (
                                  <img
                                    src={prod.image}
                                    alt={prod.name || 'Product image'}
                                    className="compareProductImage"
                                  />
                                )}
                                <span>{prod.analysisContent?.name || 'Unknown product'}</span>
                                <FaTimes
                                  className="deleteIcon"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleDeleteProduct(prod.id);
                                  }}
                                />
                              </li>
                            );
                          })}
                        </ul>

                      </div>
                      <div className="compareNowContainer">
                        <button
                          className={`compareNowBtn ${isCompareButtonDisabled ? 'disabled' : ''}`}
                          onClick={handleCompareNow}
                          disabled={isCompareButtonDisabled}
                          style={{
                            opacity: isCompareButtonDisabled ? 0.5 : 1,
                            cursor: isCompareButtonDisabled ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <FaExchangeAlt /> Compare
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className={`saveBtn ${isSaved ? "saved" : ""}`}
                  type="button"
                  onClick={handleSaveToggle}
                  onMouseEnter={() => setHoveredSaveButton(true)}
                  onMouseLeave={() => setHoveredSaveButton(false)}
                >
                  <FaBookmark /> 
                  {isSaved
                    ? (hoveredSaveButton ? "Unsave Product?" : "Product Saved!")
                    : "Save For Comparison"}
                </button>
              </div>
            </div>
          </div>

          <div className="analysisRatingSection">
            <h2 className="ratingTitle">Overall Sentiment Rating</h2>
            <div className="sentimentContainer">
              <div className="ratingContainer">
                <div className="sentiment">
                  <div className={`sentimentBadge ${reviewData.analysisContent.sentiment.toLowerCase()}`}>
                    <span className="sentimentScore">
                      {reviewData.analysisContent.sentimentRating}/5
                    </span>
                    <span className="sentimentText">
                      {reviewData.analysisContent.sentiment}
                    </span>
                  </div>
                </div>
                <div className="stars">
                  {[...Array(5)].map((_, index) => {
                    const starNumber = index + 1;
                    if (reviewData.analysisContent.sentimentRating >= starNumber) {
                      return <FaStar key={index} className="star filled" />;
                    } else if (reviewData.analysisContent.sentimentRating >= starNumber - 0.5) {
                      return <FaStarHalfAlt key={index} className="star half" />;
                    } else {
                      return <FaRegStar key={index} className="star empty" />;
                    }
                  })}
                </div>

              </div>
              <div className="tooltipContainer">
                <div className="tooltip">
                  <span className="tooltipTrigger">What do these scores mean?</span>
                  <span className="tooltipText">
                    <strong>Sentiment Score Meaning:</strong><br />
                    <strong>0.00 - 1.00:</strong> Highly Negative<br />
                    <strong>1.00 - 2.00:</strong> Negative<br />
                    <strong>2.00 - 3.00:</strong> Neutral<br />
                    <strong>3.00 - 4.00:</strong> Positive<br />
                    <strong>4.00 - 5.00:</strong> Highly Positive
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="analysisBreakdown">
            <h2 className="breakdownTitle">Sentiment Breakdown by Category</h2>
            <div className="categoryGrid">
              {Object.entries({
                "Value for Money": {
                  text: reviewData.analysisContent.valueForMoney,
                  rating: reviewData.analysisContent.valueForMoneyRating
                },
                "Sound Quality": {
                  text: reviewData.analysisContent.soundQuality,
                  rating: reviewData.analysisContent.soundQualityRating
                },
                "Comfort & Fit": {
                  text: reviewData.analysisContent.comfortFit,
                  rating: reviewData.analysisContent.comfortFitRating
                },
                "Battery Life & Charging": {
                  text: reviewData.analysisContent.batteryLife,
                  rating: reviewData.analysisContent.batteryLifeRating
                },
                "Connectivity": {
                  text: reviewData.analysisContent.connectivity,
                  rating: reviewData.analysisContent.connectivityRating
                },
                "Features & Controls": {
                  text: reviewData.analysisContent.featuresControls,
                  rating: reviewData.analysisContent.featuresControlsRating
                },
                "Call Quality": {
                  text: reviewData.analysisContent.callQuality,
                  rating: reviewData.analysisContent.callQualityRating
                },
                "Brand & Warranty": {
                  text: reviewData.analysisContent.brandWarranty,
                  rating: reviewData.analysisContent.brandWarrantyRating
                },
                "Reviews & User Feedback": {
                  text: reviewData.analysisContent.userFeedback,
                  rating: reviewData.analysisContent.userFeedbackRating
                },
                "Availability": {
                  text: reviewData.analysisContent.availability,
                  rating: reviewData.analysisContent.availabilityRating
                }
              }).map(([category, { text, rating }]) => (
                <div
                  key={category}
                  className={`categoryItem ${expandedCategories[category] ? 'expanded' : ''}`}
                  onClick={() => toggleCategory(category)}
                >
                  <div className="categoryHeader">
                    <div className="categoryTitleWrapper">
                      <span className="categoryArrow">{expandedCategories[category] ? '▼' : '▶'}</span>
                      <span className="categoryName">{category}</span>
                    </div>
                    <div className="categoryStars">
                      <span className="categoryScore">{rating}/5</span>
                      {[...Array(5)].map((_, idx) => {
                        const starNumber = idx + 1;
                        const numericRating = parseFloat(rating);
                        if (numericRating >= starNumber) {
                          return <FaStar key={idx} className="star filled-small" />;
                        } else if (numericRating >= starNumber - 0.5) {
                          return <FaStarHalfAlt key={idx} className="star half-small" />;
                        } else {
                          return <FaRegStar key={idx} className="star empty-small" />;
                        }
                      })}
                    </div>
                  </div>
                  <div className="categoryDetails">
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/// PropTypes validation so that props are properly passed to the component
/// ESLint rules require that props are validated.
AnalysisSection.propTypes = {
  reviewData: PropTypes.shape({
    image: PropTypes.string,
    name: PropTypes.string,
    amazonLink: PropTypes.string,
    analysisContent: PropTypes.shape({
      name: PropTypes.string,
      summary: PropTypes.string,
      price: PropTypes.string,
      priceSource: PropTypes.string,
      sentiment: PropTypes.string,
      sentimentRating: PropTypes.number,
      valueForMoney: PropTypes.string,
      valueForMoneyRating: PropTypes.number,
      soundQuality: PropTypes.string,
      soundQualityRating: PropTypes.number,
      comfortFit: PropTypes.string,
      comfortFitRating: PropTypes.number,
      batteryLife: PropTypes.string,
      batteryLifeRating: PropTypes.number,
      connectivity: PropTypes.string,
      connectivityRating: PropTypes.number,
      featuresControls: PropTypes.string,
      featuresControlsRating: PropTypes.number,
      callQuality: PropTypes.string,
      callQualityRating: PropTypes.number,
      brandWarranty: PropTypes.string,
      brandWarrantyRating: PropTypes.number,
      userFeedback: PropTypes.string,
      userFeedbackRating: PropTypes.number,
      availability: PropTypes.string,
      availabilityRating: PropTypes.number,
      onCompare: PropTypes.func

    })
  }),
  expandedCategories: PropTypes.object.isRequired,
  toggleCategory: PropTypes.func.isRequired,
  savedProducts: PropTypes.array.isRequired,
  setSavedProducts: PropTypes.func.isRequired,
  onCompare: PropTypes.func.isRequired
};

export default AnalysisSection;
