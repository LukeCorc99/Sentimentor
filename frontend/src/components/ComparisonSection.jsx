import { ArrowLeft } from 'lucide-react';
import { FaAmazon, FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import '../styles/ComparisonSection.css';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react'

// Register chart.js radar chart dependencies
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function ComparisonSection({ products, onBack }) {
  const [serverComparisonResult, setServerComparisonResult] = useState(null); // Data from backend comparison
  const [isLoading, setIsLoading] = useState(true); // Loading spinner toggle
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // Used to adjust width of chart to scale to screen size

  // Check if products are available for comparison. If no products are available, set to an empty array
  const effectiveProducts = (products && products.length > 0) ? products : [];

  // Check if the server returned a comparison result. If not, set to null
  const finalWinnerProduct = serverComparisonResult?.comparison?.bestProductName
    ? effectiveProducts.find(product => product.name === serverComparisonResult.comparison.bestProductName)
    : null;

  // Get the category labels from the first product's sentiment breakdown categories. If no products are available, set to an empty array
  const categoryLabels = effectiveProducts.length > 0
    ? Object.keys(effectiveProducts[0].categories)
    : [];

  // Sort products to ensure the winner is always at the end of the list. This is so it is shown more prominently (on top) of the radar chart.
  const sortedProducts = effectiveProducts.slice().sort((a, b) => {
    if (finalWinnerProduct && a.id === finalWinnerProduct.id) return 1;
    if (finalWinnerProduct && b.id === finalWinnerProduct.id) return -1;
    return 0;
  });


  // Build radar chart dataset for each product. If product is the winner, highlight the product in green.
  const radarData = {
    labels: categoryLabels,
    datasets: sortedProducts.map((product) => {
      const isWinner = finalWinnerProduct && product.id === finalWinnerProduct.id; // Check if product is the winner

      // Set the label to include "(winner)" if the product is the winner
      return {
        label: isWinner ? `${product.name} (winner)` : product.name,
        data: categoryLabels.map((label) => product.categories[label]),
        backgroundColor: isWinner
          ? "rgba(34, 197, 94, 0.41)"
          : (product.color ? product.color.replace("0.8", "0.1") : "rgba(0,0,0,0.1)"),
        borderColor: isWinner
          ? "rgba(34,197,94,1)"
          : (product.color || "#000"),
        borderWidth: isWinner ? 4 : 1,
        pointBackgroundColor: isWinner
          ? "rgba(34,197,94,1)"
          : (product.color || "#000"),
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: isWinner
          ? "rgba(34,197,94,1)"
          : (product.color || "#000"),
      };
    }),
  };


  // Radar chart display configuration
  const radarOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        min: 0,
        ticks: {
          stepSize: 1,
          color: 'rgba(255, 255, 255, 0.6)',
          backdropColor: 'transparent'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: { size: windowWidth <= 1250 ? 12 : windowWidth <= 1350 ? 13 : windowWidth <= 1400 ? 14 : windowWidth <= 1500 ? 15 : windowWidth <= 1600 ? 17 : 19 }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: { size: windowWidth <= 1250 ? 12 : windowWidth <= 1400 ? 12.5 : windowWidth <= 1500 ? 13 : windowWidth <= 1600 ? 13.5 : 14 },
          boxWidth: 15,
          padding: 10
        }
      }
    },
    maintainAspectRatio: false
  };

  // Fetch comparison data from the server when the comparison screen loads. Hide the loading screen
  useEffect(() => {
    if (products && products.length > 1) {
      fetchComparisonFromServer();
    } else {
      setIsLoading(false);
    }
  }, [products]);

  // Update the window width when the window is resized. This is used to adjust the radar chart when the screen size changes.
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  // Send selected products to the backend and retrieve comparison results
  const fetchComparisonFromServer = async () => {
    try {
      setIsLoading(true);

      // Localhost server for testing, heroku server for production
      // const response = await fetch("http://127.0.0.1:8082/compareproducts", {
      // const response = await fetch("https://sentimentor-productcomparator-116de15a416a.herokuapp.com/compareproducts", {
      const response = await fetch("https://sentimentor-productcomparator-116de15a416a.herokuapp.com/compareproducts", {
      method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analyses: products }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Comparison from server:", data);
        setServerComparisonResult(data); // Store comparison result
      } else {
        console.error("Server error:", data.error);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Network error:", error);
      setIsLoading(false);
    }
  };

  // Show loading screen whilst fetching comparison
  if (isLoading) {
    return (
      <div className="comparisonContainer">
        <div className="comparisonCard">
          <h1 className="loadingTitle">Analyzing Products</h1>
          <div className="loadingContainer">
            <div className="loadingSpinner"></div>
            <p className="loadingText">Comparing products and determining the best option...</p>
          </div>
          <button className="backButton" onClick={onBack}>
            <ArrowLeft />
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="comparisonContainer">
      <div className="comparisonCard">
        <h1 className="comparisonTitle">Product Comparison</h1>
        {effectiveProducts.length > 0 ? (
          <>
            <div className="productGrid">
              <div className={`productGridInner ${effectiveProducts.length === 3
                  ? 'threeProductLayout'
                  : effectiveProducts.length === 2
                    ? 'twoProductLayout'
                    : ''
                }`}>
                {effectiveProducts.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className={`productCard ${finalWinnerProduct && product.id === finalWinnerProduct.id ? 'winner' : ''}`}
                    style={{ borderColor: finalWinnerProduct && product.id === finalWinnerProduct.id ? '#22c55e' : (product.color || '#ccc') }}
                  >
                    <div className="productComparisonInfo">
                      <h2 className="productComparisonName">{product.name}</h2>
                    </div>
                    <div className="imageContainerWrapper">
                      {product.amazonLink && (
                        <a
                          href={product.amazonLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="amazonBtnOverlay"
                        >
                          <FaAmazon />Search Amazon
                        </a>
                      )}
                      {finalWinnerProduct && product.id === finalWinnerProduct.id && (
                        <div className="winnerLabel">Winner</div>
                      )}
                      <img src={product.image} alt={product.name} className="productImage" />
                      <div className="productRatingContainer">
                        <div className="starsComparison">
                          {[...Array(5)].map((_, i) => {
                            const starNumber = i + 1;
                            if (product.rating >= starNumber) {
                              return <FaStar key={i} size={20} className="starComparison filled" />;
                            } else if (product.rating >= starNumber - 0.5) {
                              return <FaStarHalfAlt key={i} size={20} className="starComparison half" />;
                            } else {
                              return <FaRegStar key={i} size={20} className="starComparison empty" />;
                            }
                          })}
                        </div>
                        <span className="ratingNumber">{product.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="productPrice" style={{ borderColor: product.color || '#ccc' }}>
                      {product.price}
                    </div>
                  </div>
                ))}
                <div className="vs">vs</div>
              </div>
            </div>
            <div className="winnerSection">
              {finalWinnerProduct && serverComparisonResult?.comparison && (
                <>
                  <h2 className="winnerTitle">Why are {finalWinnerProduct.name} the best?</h2>
                  <p className="winnerDescription">
                    {serverComparisonResult.comparison.bestProductReason}
                  </p>
                </>
              )}
            </div>
            <div className="chartContainer">
              <h2 className="chartTitle">Category Comparison</h2>
              <div className="chartWrapper">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>
            <button className="backButton" onClick={onBack}>
              <ArrowLeft />
              Back
            </button>
          </>
        ) : (
          <p>No products available for comparison.</p>
        )}
      </div>
    </div>
  );
}

ComparisonSection.propTypes = {
  products: PropTypes.array.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default ComparisonSection;