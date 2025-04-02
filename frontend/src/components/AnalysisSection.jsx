import { FaAmazon, FaStar } from "react-icons/fa";
import '../styles/AnalysisSection.css';
import PropTypes from 'prop-types';


function AnalysisSection({ reviewData, expandedCategories, toggleCategory }) {
  if (!reviewData) return null;

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
            <div className="analysisPrice">
              <span className="priceAmount">{reviewData.analysisContent.price}</span>
              <span className="priceSource">via {reviewData.analysisContent.priceSource}</span>
            </div>
            {reviewData.amazonLink && (
              <a
                href={reviewData.amazonLink}
                target="_blank"
                rel="noopener noreferrer"
                className="amazonBtn"
              >
                <FaAmazon /> View on Amazon
              </a>
            )}
          </div>

          <div className="analysisRatingSection">
            <h2 className="sectionTitle">Overall Sentiment Rating</h2>
            <div className="ratingContainer">
              <div className="stars">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={index < Math.round(reviewData.analysisContent.sentimentRating) ? "star filled" : "star"}
                  />
                ))}
              </div>
              <div className={`sentimentBadge ${reviewData.analysisContent.sentiment.toLowerCase()}`}>
                {reviewData.analysisContent.sentimentRating}/5 - {reviewData.analysisContent.sentiment}
              </div>
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

          <div className="analysisBreakdown">
            <h2 className="sectionTitle">Sentiment Breakdown by Category</h2>
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
                      {[...Array(5)].map((_, idx) => (
                        <FaStar
                          key={idx}
                          className={idx < Math.round(parseFloat(rating)) ? "star filled-small" : "star empty-small"}
                        />
                      ))}
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

/// PropTypes validation ensures that the `reviewData`, `expandedCategories`, and `toggleCategory` props are properly passed to the component.
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
        availabilityRating: PropTypes.number
      })
    }),
    expandedCategories: PropTypes.object.isRequired,
    toggleCategory: PropTypes.func.isRequired
  };

export default AnalysisSection;
