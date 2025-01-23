import React, { useState, useEffect } from 'react';
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
        <div>
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