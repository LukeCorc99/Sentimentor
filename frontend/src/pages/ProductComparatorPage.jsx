import React, { useState, useEffect } from 'react';
import '../styles/ProductComparatorPage.css';
import { useLocation } from 'react-router-dom';
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const ProductComparatorPage = () => {
    const location = useLocation();
    const productOne = location.state?.product; // Access the passed product data
    const [saved, setSaved] = useState([]); // State to store the list of saved products
    const [productTwo, setSelectedProduct] = useState(null); // State to store the currently selected product
    const [comparisonResult, setComparisonResult] = useState(null); // State to store the comparison result


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

    const compareAnalysis = async (analysisOne, analysisTwo) => {
        try {
            const response = await fetch("http://127.0.0.1:8082/compareproducts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    analysisOne: analysisOne,
                    analysisTwo: analysisTwo,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log("Products compared successfully:", data.message);
                setComparisonResult(data.comparison); // Update the state with the comparison result
            } else {
                console.error("Error comparing products:", data.error);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    return (
        <div>
            <h1>Product Comparator</h1>

            {/* Current product display */}
            {productOne && (
                <div>
                    <h2>{productOne.name}</h2>
                    <p><strong>Summary:</strong> {productOne.analysisContent.summary}</p>
                    <p><strong>Sentiment Score:</strong> {productOne.analysisContent.score}</p>
                    <p><strong>Pros:</strong></p>
                    <ul>
                        {productOne.analysisContent.pros.map((pro, idx) => (
                            <li key={idx}>{pro}</li>
                        ))}
                    </ul>
                    <p><strong>Cons:</strong></p>
                    <ul>
                        {productOne.analysisContent.cons.map((con, idx) => (
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
            {productTwo && (
                <div>
                    <h2>{productTwo.name}</h2>
                    <p><strong>Summary:</strong> {productTwo.analysisContent.summary}</p>
                    <p><strong>Sentiment Score:</strong> {productTwo.analysisContent.score}</p>
                    <p><strong>Pros:</strong></p>
                    <ul>
                        {productTwo.analysisContent.pros.map((pro, idx) => (
                            <li key={idx}>{pro}</li>
                        ))}
                    </ul>
                    <p><strong>Cons:</strong></p>
                    <ul>
                        {productTwo.analysisContent.cons.map((con, idx) => (
                            <li key={idx}>{con}</li>
                        ))}
                    </ul>
                    <button onClick={() => compareAnalysis(productOne, productTwo)} className="analyzebutton">
                        Compare Products
                    </button>
                </div>
            )}
            {/* Display the comparison result */}
            {comparisonResult && (
                <div className="comparison-result">
                    <h2>Comparison Result</h2>
                    <p><strong>Summary:</strong> {comparisonResult.summary}</p>
                    <p><strong>Advantages of {productOne.name} over {productTwo.name}:</strong></p>
                    <ul>
                        {comparisonResult.advantages1.map((adv, idx) => (
                            <li key={idx}>{adv}</li>
                        ))}
                    </ul>
                    <p><strong>Disadvantages of {productOne.name} over {productTwo.name}:</strong></p>
                    <ul>
                        {comparisonResult.disadvantages1.map((dis, idx) => (
                            <li key={idx}>{dis}</li>
                        ))}
                    </ul>
                    <p><strong>Advantages of {productTwo.name} over {productOne.name}:</strong></p>
                    <ul>
                        {comparisonResult.advantages2.map((adv, idx) => (
                            <li key={idx}>{adv}</li>
                        ))}
                    </ul>
                    <p><strong>Disadvantages of {productTwo.name} over {productOne.name}:</strong></p>
                    <ul>
                        {comparisonResult.disadvantages2.map((dis, idx) => (
                            <li key={idx}>{dis}</li>
                        ))}
                    </ul>
                    <p><strong>Recommendation:</strong> {comparisonResult.recommendation}</p>
                    <p><strong>Sources:</strong></p>
                    <ul>
                        {comparisonResult.sources.map((source, idx) => (
                            <li key={idx}>{source}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProductComparatorPage;
