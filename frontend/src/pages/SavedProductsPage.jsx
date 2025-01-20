import React, { useState, useEffect } from 'react';
import '../styles/SavedProductsPage.css'; // Import the CSS file for styling
import { db } from "../firebaseConfig"; // Path to firebaseConfig.js
import { collection, getDocs } from "firebase/firestore"; // Firestore functions

const SavedProductsPage = () => {
    // State for storing all previosuly saved analyzed products.
    const [saved, setSaved] = useState([]);

    useEffect(() => {
        const fetchSavedProducts = async () => {
            try {
                // Fetch reviews from Firestore
                const querySnapshot = await getDocs(collection(db, "savedproducts"));
                const savedProducts = querySnapshot.docs.map((doc) => doc.data());
                setSaved(savedProducts); // Update the state with fetched reviews
            } catch (error) {
                console.error("Error fetching reviews from Firestore:", error);
            }
        };

        fetchSavedProducts(); // Call the function to fetch data
    }, []); // Run only once when the component mounts


    return (
        <div className="saved-products-container">
            <h1>Saved Products</h1>
            {/* If there are saved products, display them in a list */}
            {saved.length > 0 ? (
                <ul className="saved-products-list">
                    {saved.map((product, index) => (
                        <li key={index} className="saved-product-item">
                            {/* Display product details */}
                            <h3>{product.name}</h3>
                            <p><strong>Summary:</strong> {product.analysisContent.summary}</p>
                            <p><strong>Sentiment Score:</strong> {product.analysisContent.score}</p>
                            <p><strong>Pros:</strong></p>
                            <ul>
                                {product.analysisContent.pros.map((pro, idx) => (
                                    <li key={idx}>{pro}</li>
                                ))}
                            </ul>
                            <p><strong>Cons:</strong></p>
                            <ul>
                                {product.analysisContent.cons.map((con, idx) => (
                                    <li key={idx}>{con}</li>
                                ))}
                            </ul>
                            <a href={product.link} target="_blank" rel="noopener noreferrer">
                                View Product
                            </a>
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