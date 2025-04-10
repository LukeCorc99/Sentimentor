import { useState } from 'react'
import { FaAmazon, FaStar, FaStarHalfAlt, FaRegStar, FaExchangeAlt, FaTimes } from "react-icons/fa";
import '../styles/AnalysisSection.css';
import PropTypes from 'prop-types';
import { getAuth } from 'firebase/auth'



function AnalysisSection({ reviewData, expandedCategories, toggleCategory, savedProducts = [], setSavedProducts, onCompare }) {
  const [showCompareTooltip, setShowCompareTooltip] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  const handleCompareToggle = () => {
    setShowCompareTooltip((prev) => !prev);
  };

  const handleCheckboxChange = (productId) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        if (prev.length < 4) {
          return [...prev, productId];
        } else {
          return prev;
        }
      }
    });
  };


  const handleCompareNow = () => {
    if (onCompare) {
      onCompare(selectedForCompare);
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

      const response = await fetch("http://127.0.0.1:8082/deleteproduct", {
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
                      <FaAmazon />Search Amazon
                    </a>
                  </>
                )}
                <div className="compareBtnWrapper">
                  <button className="compareBtn" type="button" onClick={handleCompareToggle}>
                    <FaExchangeAlt /> Compare Product
                  </button>

                  {showCompareTooltip && (
                    <div className="compareTooltip">
                      <h3>Select up to 4 Previously Saved Products to Compare With:</h3>
                      <div className="compareProductsContainer">
                        <ul>
                          {savedProducts.map((prod) => {
                            const isSelected = selectedForCompare.includes(prod.id);
                            return (
                              <li
                                key={prod.id}
                                className={`compareProductItem ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleCheckboxChange(prod.id)}
                              >
                                {prod.image && (
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="compareProductImage"
                                  />
                                )}
                                <span>{prod.name}</span>
                                <FaTimes
                                  className="deleteIcon"
                                  style={{ cursor: 'pointer', marginLeft: 'auto' }}
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
                        <button className="compareNowBtn" onClick={handleCompareNow}> <FaExchangeAlt /> Compare</button>
                      </div>
                    </div>
                  )}
                </div>
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
