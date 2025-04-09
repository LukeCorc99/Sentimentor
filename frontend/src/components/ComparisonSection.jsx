import { useState } from 'react';
import { Star, ArrowLeft } from 'lucide-react';
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
      categories: {
        "Sound Quality": 4,
        "Comfort": 3,
        "Battery Life": 5,
        "Value": 3,
        "Connectivity": 4
      },
      color: "rgba(255, 99, 132, 0.8)"
    },
    {
      id: "2",
      name: "JAYS a-Six Wireless – 50-metre dash!",
      image: "https://images.squarespace-cdn.com/content/v1/5beb251ab40b9dd2724c2f46/8370843d-a3fd-4302-a407-839706af3df2/AXS+Audio+TWS+review+test+comparison.jpg",
      rating: 3.5,
      price: "€79",
      categories: {
        "Sound Quality": 3,
        "Comfort": 4,
        "Battery Life": 3,
        "Value": 4,
        "Connectivity": 3
      },
      color: "rgba(54, 162, 235, 0.8)"
    },
    {
      id: "3",
      name: "Meze Audio 105 AER open-backed headphones",
      image: "https://images.squarespace-cdn.com/content/v1/5beb251ab40b9dd2724c2f46/62e2fae7-567d-4fe2-871f-2d30c844d8fc/Edifier+NeoDots+review+vs+NeoBuds+2+Soundcore.jpeg",
      rating: 4.5,
      price: "€149",
      categories: {
        "Sound Quality": 4.5,
        "Comfort": 4,
        "Battery Life": 4,
        "Value": 4.5,
        "Connectivity": 4
      },
      color: "rgba(75, 192, 192, 0.8)"
    },
    {
      id: "4",
      name: "1MORE Triple Driver In-Ear Headphones",
      image: "https://images.squarespace-cdn.com/content/v1/5beb251ab40b9dd2724c2f46/ea367c65-c723-4506-979b-a2c2678dec16/Final+Audio+ZE3000+review+vs+Nuarl+N6+Pro2+Melomania+1+Plus.jpg",
      rating: 4.2,
      price: "€129",
      categories: {
        "Sound Quality": 4.2,
        "Comfort": 4,
        "Battery Life": 4,
        "Value": 4.2,
        "Connectivity": 4
      },
      color: "rgba(153, 102, 255, 0.8)"
    }
  ];

  const effectiveProducts = products && products.length > 0 ? products : dummyProducts;
  const [highlightedProduct] = useState(effectiveProducts[0].id);
  const winnerId = effectiveProducts[0].id;


  const categoryLabels =
    effectiveProducts.length > 0 ? Object.keys(effectiveProducts[0].categories) : [];

  const radarData = {
    labels: categoryLabels,
    datasets: effectiveProducts.map(product => ({
      label: product.name,
      data: categoryLabels.map(label => product.categories[label]),
      backgroundColor: product.color.replace('0.8', highlightedProduct === product.id ? '0.5' : '0.1'),
      borderColor: product.color,
      borderWidth: highlightedProduct === product.id ? 3 : 1,
      pointBackgroundColor: product.color,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: product.color
    }))
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
          font: { size: 15 }
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
                  <div className="ratingContainer">
                    <div className="starsComparison">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={`starComparison ${i < Math.floor(product.rating) ? 'filled' : 'empty'}`}
                        />
                      ))}
                    </div>
                    <span className="ratingNumber">{product.rating.toFixed(1)}</span>
                  </div>
                </div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="productImage"
                />
                <div
                  className="productPrice"
                  style={{ borderColor: product.color }}
                >
                  {product.price}
                </div>
                {product.id === winnerId && <div className="winnerLabel">Winner</div>}
              </div>
            ))}
            <div className="vs">vs</div>
          </div>
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
