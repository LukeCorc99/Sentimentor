import React, { useState, useEffect } from 'react';
import '../styles/ProductComparatorPage.css';
import { useLocation } from 'react-router-dom';
import { db } from "../firebaseConfig"; 
import { collection, getDocs } from "firebase/firestore";

const ProductComparatorPage = () => {
    const location = useLocation();
    const product = location.state?.product; // Access the passed product data
    const [saved, setSaved] = useState([]); // State to store the list of saved products
    const [selectedProduct, setSelectedProduct] = useState(null); // State to store the currently selected product

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

    const selectProductToCompare = (event) => {
        // Find the selected product from the saved list
        const selected = saved.find((product) => product.id === event.target.value);
        setSelectedProduct(selected); // Update the selected product state
    };

    return (
        <div>
            <h1>Product Comparator</h1>

            {/* Current product display */}
            {product && (
                <div>
                    <h2>{product.name}</h2>
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
                </div>
            )}

            {/* Dropdown menu to select a product */}
            <div>
                <label htmlFor="product-select">Compare with:</label>
                <select id="product-select" onChange={selectProductToCompare} defaultValue="">
                    <option value="" disabled>Select a product</option>
                    {saved.map((savedProduct) => (
                        <option key={savedProduct.id} value={savedProduct.id}>
                            {savedProduct.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Display the selected product from the dropdown */}
            {selectedProduct && (
                <div>
                    <h2>{selectedProduct.name}</h2>
                    <p><strong>Summary:</strong> {selectedProduct.analysisContent.summary}</p>
                    <p><strong>Sentiment Score:</strong> {selectedProduct.analysisContent.score}</p>
                    <p><strong>Pros:</strong></p>
                    <ul>
                        {selectedProduct.analysisContent.pros.map((pro, idx) => (
                            <li key={idx}>{pro}</li>
                        ))}
                    </ul>
                    <p><strong>Cons:</strong></p>
                    <ul>
                        {selectedProduct.analysisContent.cons.map((con, idx) => (
                            <li key={idx}>{con}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProductComparatorPage;
