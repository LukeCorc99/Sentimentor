import React, { useEffect, useState } from 'react';

function App() {
  const [cameraReviews, setCameraReviews] = useState([]);

  // Fetch data from the Flask API
  useEffect(() => {
    fetch('http://127.0.0.1:8080/api/cameras') // Ensure this matches your Flask server URL
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        setCameraReviews(data);
      })
      .catch((error) => {
        console.error('Error fetching the camera reviews:', error);
      });
  }, []);

  return (
    <div>
      <h1>Camera Reviews</h1>
      <ul>
        {cameraReviews.map((review, index) => (
          <li key={index}>
            <a href={review.link} target="_blank" rel="noopener noreferrer">
              {review.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;