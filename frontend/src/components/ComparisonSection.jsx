import { ArrowLeft } from 'lucide-react';
import { FaAmazon, FaStar, FaStarHalfAlt, FaRegStar, } from "react-icons/fa";
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


ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function ComparisonSection({ products, onBack }) {
  const dummyProducts = [
    {
      id: "1",
      name: "Oriolus Finschi",
      image: "https://images.squarespace-cdn.com/content/v1/5beb251ab40b9dd2724c2f46/ac2f26d5-8052-4af9-8d49-cf5297edda2a/Apple+AirPods+4+vs+cheaper+alternatives+review.jpeg",
      rating: 4.0,
      price: "€99",
      amazonLink: "https://www.amazon.com/s?k=Apple+AirPods+4",
      categories: {
        "Sound Quality": 4,
        "Comfort": 3,
        "Battery Life": 5,
        "Value": 3,
        "Connectivity": 4,
        "Brand & Warranty": 2.5,
        "User Feedback": 3.4,
        "Availability": 4.9
      },
      color: "rgba(255, 99, 132, 0.8)"
    },
    {
      id: "2",
      name: "JAYS a-Six Wireless – 50-metre dash!",
      image: "https://images.squarespace-cdn.com/content/v1/5beb251ab40b9dd2724c2f46/8370843d-a3fd-4302-a407-839706af3df2/AXS+Audio+TWS+review+test+comparison.jpg",
      rating: 3.5,
      price: "€79",
      amazonLink: "https://www.amazon.com/s?k=Wireless+Audio",
      categories: {
        "Sound Quality": 3,
        "Comfort": 4,
        "Battery Life": 3,
        "Value": 4,
        "Connectivity": 3,
        "Brand & Warranty": 3,
        "User Feedback": 4.2,
        "Availability": 4.2
      },
      color: "rgba(54, 162, 235, 0.8)"
    },
    {
      id: "3",
      name: "Meze Audio 105 AER open-backed headphones",
      image: "https://images.squarespace-cdn.com/content/v1/5beb251ab40b9dd2724c2f46/62e2fae7-567d-4fe2-871f-2d30c844d8fc/Edifier+NeoDots+review+vs+NeoBuds+2+Soundcore.jpeg",
      rating: 4.5,
      price: "€149",
      amazonLink: "https://www.amazon.com/s?k=Meze+Audio+105",
      categories: {
        "Sound Quality": 4.5,
        "Comfort": 4,
        "Battery Life": 4,
        "Value": 4.5,
        "Connectivity": 4,
        "Brand & Warranty": 4.1,
        "User Feedback": 4.7,
        "Availability": 4.2
      },
      color: "rgba(186, 192, 75, 0.8)"
    },
    {
      id: "4",
      name: "1MORE Triple Driver In-Ear Headphones",
      image: "https://images.squarespace-cdn.com/content/v1/5beb251ab40b9dd2724c2f46/ea367c65-c723-4506-979b-a2c2678dec16/Final+Audio+ZE3000+review+vs+Nuarl+N6+Pro2+Melomania+1+Plus.jpg",
      rating: 4.2,
      price: "€129",
      amazonLink: "https://www.amazon.com/s?k=1MORE+Headphones",
      categories: {
        "Sound Quality": 4.2,
        "Comfort": 4,
        "Battery Life": 4,
        "Value": 4.2,
        "Connectivity": 4,
        "Brand & Warranty": 4.5,
        "User Feedback": 4.2,
        "Availability": 4.5
      },
      color: "rgba(153, 102, 255, 0.8)"
    }
  ];


  const effectiveProducts = products && products.length > 0 ? products : dummyProducts;
  const winnerId = effectiveProducts[0].id;
  const winnerProduct = effectiveProducts.find(product => product.id === winnerId);


  const categoryLabels =
    effectiveProducts.length > 0 ? Object.keys(effectiveProducts[0].categories) : [];

  const sortedProducts = effectiveProducts.slice().sort((a, b) => {
    if (a.id === winnerId) return 1;
    if (b.id === winnerId) return -1;
    return 0;
  });

  const radarData = {
    labels: categoryLabels,
    datasets: sortedProducts.map((product) => {
      const isWinner = product.id === winnerId;
      return {
        label: isWinner ? `${product.name} (winner)` : product.name,
        data: categoryLabels.map((label) => product.categories[label]),
        backgroundColor: isWinner
          ? "rgba(34,197,94,0.7)"
          : product.color.replace("0.8", "0.1"),
        borderColor: isWinner
          ? "rgba(34,197,94,1)"
          : product.color,
        borderWidth: isWinner ? 4 : 1,
        pointBackgroundColor: isWinner
          ? "rgba(34,197,94,1)"
          : product.color,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: isWinner
          ? "rgba(34,197,94,1)"
          : product.color,
      };
    }),
  };


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
          font: { size: 19 }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: { size: 14 },
          boxWidth: 15,
          padding: 10
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="comparisonContainer">
      <div className="comparisonCard">
        <h1 className="comparisonTitle">Product Comparison</h1>
        <div className="productGrid">
          <div className="productGridInner">
            {effectiveProducts.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className={`productCard ${product.id === winnerId ? 'winner' : ''}`}
                style={{ borderColor: product.id === winnerId ? '#22c55e' : product.color }}
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
                  <img src={product.image} alt={product.name} className="productImage" />
                  <div className="ratingContainerOverlay">
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

                <div className="productPrice" style={{ borderColor: product.color }}>
                  {product.price}
                </div>
                {product.id === winnerId && <div className="winnerLabel">Winner</div>}
              </div>
            ))}
            <div className="vs">vs</div>
          </div>
        </div>

        <div className="winnerSection">
          <h2 className="winnerTitle">Why is {winnerProduct.name} the best?</h2>
          <p className="winnerDescription">
            This product stands out among competitors because of its exceptional quality, innovative design, and unmatched performance. Its cutting-edge technology and reliable durability make it a top choice for customers seeking both efficiency and style. Experience the excellence that sets it apart from the rest. Discover superior innovation and lasting satisfaction.
          </p>
        </div>

        <div className="chartContainer">
          <h2 className="chartTitle">Category Comparison</h2>
          <div className="chartWrapper">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        <button
          className="backButton"
          onClick={() => {
            if (typeof onBack === "function") {
              onBack();
            }
          }}
        >
          <ArrowLeft />
          Back
        </button>
      </div>
    </div>
  );

}

ComparisonSection.propTypes = {
  products: PropTypes.array,
  onBack: PropTypes.func
};


export default ComparisonSection;
