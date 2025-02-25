import { useState, useEffect } from 'react';
import '../styles/SavedProductsPage.css'; // Import the CSS file for styling
import { db } from "../firebaseConfig"; // Path to firebaseConfig.js
import { collection, getDocs } from "firebase/firestore"; // Firestore functions
import { useNavigate } from 'react-router-dom';

const SavedProductsPage = () => {
    // State for storing all previously saved analyzed products.
    const [saved, setSaved] = useState([]);
    const navigate = useNavigate(); // Use useNavigate hook to navigate to other pages 

    useEffect(() => {
        const fetchSavedProducts = async () => {
            try {
                // Fetch reviews from Firestore
                const querySnapshot = await getDocs(collection(db, "savedproducts"));
                const savedProducts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // Add the document ID to the product data
                setSaved(savedProducts); // Update the state with fetched reviews
            } catch (error) {
                console.error("Error fetching reviews from Firestore:", error);
            }
        };

        fetchSavedProducts(); // Call the function to fetch data
    }, []); // Run only once when the component mounts

    const deleteProduct = async (product) => {
        try {
            const response = await fetch("http://127.0.0.1:8082/deleteproduct", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: product.id }), // Send the product ID
            });

            const data = await response.json();
            if (response.ok) {
                console.log("Product deleted successfully:", data.message);
                //Update state to rerender the list
                setSaved(saved.filter(p => p.id !== product.id))
            } else {
                console.error("Error deleting product:", data.error);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    const compareProduct = (product) => {
        // Navigate to the product comparator with state
        navigate('/compare', { state: { product } });
    };

    return (
        <div className="appcontainer">
            <h1>Saved Products</h1>
            {saved.length > 0 ? (
                <ul>
                    {saved.map((product, index) => (
                        <li key={index}>
                            <h3>{product.name}</h3>
                            {product.image && (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="reviewimage"
                                    referrerPolicy="no-referrer"
                                />
                            )}

                            {product.links && product.links.length > 0 && (
                                <div>
                                    {product.links.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ marginRight: "10px" }}
                                        >
                                            View Product Review {index + 1}
                                        </a>
                                    ))}
                                </div>
                            )}

                            <p><strong>Summary:</strong> {product.analysisContent.summary}</p>
                            <p><strong>Price:</strong> {product.analysisContent.price} <strong>Source:</strong> {product.analysisContent.priceSource} </p>

                            {product.amazonLink && (
                                <div>
                                    <a
                                        href={product.amazonLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Buy on Amazon
                                    </a>
                                </div>
                            )}

                            <h4>Specifications:</h4>
                            <ul>
                                {product.analysisContent.specifications.map((spec, idx) => (
                                    <li key={idx}>{spec}</li>
                                ))}
                            </ul>

                            <div>
                                <p><strong>Overall Sentiment Rating:  </strong>
                                    {product.analysisContent.sentimentRating} - <strong> {product.analysisContent.sentiment} </strong>
                                </p>


                                <h4>Sentiment Breakdown by Category:</h4>
                                <ul>
                                    <li><strong>Value for Money:</strong> {product.analysisContent.priceValue}</li>
                                    <li><strong>Sound Quality:</strong> {product.analysisContent.soundQuality}</li>
                                    <li><strong>Comfort & Fit:</strong> {product.analysisContent.comfortFit}</li>
                                    <li><strong>Battery Life & Charging:</strong> {product.analysisContent.batteryLife}</li>
                                    <li><strong>Connectivity & Compatibility:</strong> {product.analysisContent.connectivity}</li>
                                    <li><strong>Features & Controls:</strong> {product.analysisContent.featuresControls}</li>
                                    <li><strong>Call Quality & Microphone Performance:</strong> {product.analysisContent.callQuality}</li>
                                    <li><strong>Brand & Warranty:</strong> {product.analysisContent.brandWarranty}</li>
                                    <li><strong>Reviews & User Feedback:</strong> {product.analysisContent.userFeedback}</li>
                                    <li><strong>Availability & Local Factors:</strong> {product.analysisContent.availability}</li>
                                </ul>
                            </div>

                            <button onClick={() => deleteProduct(product)} className="analyzebutton">
                                Delete
                            </button>
                            <button onClick={() => compareProduct(product)} className="analyzebutton">
                                Compare
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No products found.</p>
            )}
        </div>
    );
};

export default SavedProductsPage;