import { useState, useEffect } from 'react';
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
        <div className="appcontainer">
            <h1>Product Comparator</h1>

            {productOne && (
                <div>
                    <h2>{productOne.name}</h2>
                    {productOne.image && (
                        <img src={productOne.image} alt={productOne.name} className="reviewimage" referrerPolicy="no-referrer" />
                    )}
                    <p><strong>Summary:</strong> {productOne.analysisContent.summary}</p>
                    <p><strong>Price:</strong> {productOne.analysisContent.price} <strong>Source:</strong> {productOne.analysisContent.priceSource}</p>

                    <h4>Specifications:</h4>
                    <ul>
                        {productOne.analysisContent.specifications.map((spec, idx) => (
                            <li key={idx}>{spec}</li>
                        ))}
                    </ul>

                    <div>
                        <h4>Overall Sentiment Rating:</h4>
                        <p><strong>{productOne.analysisContent.sentimentRating}</strong> - {` ${productOne.analysisContent.sentiment}`}</p>
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="productselect">Compare with:</label>
                <select id="productselect" onChange={selectProductToCompare} defaultValue="">
                    <option value="" disabled>Select a product</option>
                    {saved.map((savedProduct) => (
                        <option key={savedProduct.id} value={savedProduct.id}>
                            {savedProduct.name}
                        </option>
                    ))}
                </select>
            </div>

            {productTwo && (
                <div>
                    <h2>{productTwo.name}</h2>
                    {productTwo.image && (
                        <img src={productTwo.image} alt={productTwo.name} className="reviewimage" referrerPolicy="no-referrer" />
                    )}
                    <p><strong>Summary:</strong> {productTwo.analysisContent.summary}</p>
                    <p><strong>Price:</strong> {productTwo.analysisContent.price} <strong>Source:</strong> {productTwo.analysisContent.priceSource}</p>

                    <h4>Specifications:</h4>
                    <ul>
                        {productTwo.analysisContent.specifications.map((spec, idx) => (
                            <li key={idx}>{spec}</li>
                        ))}
                    </ul>

                    <div>
                        <h4>Overall Sentiment Rating:</h4>
                        <p><strong>{productTwo.analysisContent.sentimentRating}</strong> - {` ${productTwo.analysisContent.sentiment}`}</p>
                    </div>

                    <button onClick={() => compareAnalysis(productOne, productTwo)} className="analyzebutton">
                        Compare Products
                    </button>
                </div>
            )}

            {comparisonResult && (
                <div>
                    <h2>Comparison Result</h2>

                    <p><strong>Summary:</strong> {comparisonResult.summary}</p>

                    <p><strong>{comparisonResult.name1} Price of Product One:</strong> {comparisonResult.price1} <strong>Source:</strong> {comparisonResult.priceSource1}</p>
                    <p><strong>{comparisonResult.name2} Price of Product Two:</strong> {comparisonResult.price2} <strong>Source:</strong> {comparisonResult.priceSource2}</p>

                    <h4>Specifications:</h4>
                    <div>
                        <div>
                            <h5>{comparisonResult.name1} Specifications:</h5>
                            <ul>
                                {comparisonResult.specifications1.map((spec, idx) => (
                                    <li key={idx}>{spec}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5>{comparisonResult.name2} Specifications:</h5>
                            <ul>
                                {comparisonResult.specifications2.map((spec, idx) => (
                                    <li key={idx}>{spec}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <h4>Feature Comparisons:</h4>
                    <ul>
                        <li><strong>Price & Value:</strong> {comparisonResult.valueForMoneyComparison}</li>
                        <li><strong>Sound Quality:</strong> {comparisonResult.soundQualityComparison}</li>
                        <li><strong>Comfort & Fit:</strong> {comparisonResult.comfortFitComparison}</li>
                        <li><strong>Battery Life & Charging:</strong> {comparisonResult.batteryLifeComparison}</li>
                        <li><strong>Connectivity & Compatibility:</strong> {comparisonResult.connectivityComparison}</li>
                        <li><strong>Features & Controls:</strong> {comparisonResult.featuresControlsComparison}</li>
                        <li><strong>Call Quality & Microphone Performance:</strong> {comparisonResult.callQualityComparison}</li>
                        <li><strong>Brand & Warranty:</strong> {comparisonResult.brandWarrantyComparison}</li>
                        <li><strong>Reviews & User Feedback:</strong> {comparisonResult.userFeedbackComparison}</li>
                        <li><strong>Availability:</strong> {comparisonResult.availabilityComparison}</li>
                        <li><strong>Overall Sentiment:</strong> {comparisonResult.overallSentimentComparison}</li>
                    </ul>

                    <h4>Final Recommendation:</h4>
                    <p>{comparisonResult.recommendation}</p>
                </div>
            )}
        </div>
    );
};

export default ProductComparatorPage;
