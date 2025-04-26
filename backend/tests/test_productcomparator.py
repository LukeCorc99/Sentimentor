import pytest
import json
from unittest.mock import patch, MagicMock
import sys
import os
import time

# Mock firebase imports for CI/CD
sys.modules["firebase_admin"] = MagicMock()
sys.modules["firebase_admin.credentials"] = MagicMock()
sys.modules["firebase_admin.firestore"] = MagicMock()

# Mock BAML client for CI/CD
sys.modules["baml_client.sync_client"] = MagicMock()
sys.modules["baml_client.sync_client"].b = MagicMock()
sys.modules["baml_client.sync_client"].b.CompareAnalysis = MagicMock()

# Add parent directory to the path to import the main app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from productcomparator.main import app, productToReviewText, multiProductComparison


# Create a test client for Flask
@pytest.fixture
def client():
    with app.test_client() as client:
        yield client


# Tests for the productToReviewText function, which formats product data to comparison format for analysis
class TestProductToReviewText:
    # Converting an empty product to comparison format
    def testEmptyProduct(self):
        product = {}
        result = productToReviewText(product)
        expected = "Name: \nPrice: \nRating: "
        assert result == expected

    # Converting a complete product with categories to comparison format
    def testCompleteProduct(self):
        product = {
            "name": "Test Headphones",
            "price": "$100",
            "rating": "4.5",
            "categories": {
                "soundQuality": "Excellent",
                "batteryLife": "8 hours",
                "comfort": "Very good",
            },
        }
        result = productToReviewText(product)
        expected = "Name: Test Headphones\nPrice: $100\nRating: 4.5\nsoundQuality: Excellent\nbatteryLife: 8 hours\ncomfort: Very good"
        assert result == expected

    # Converting a product without categories to comparison format
    def testProductWithoutCategories(self):
        product = {"name": "Test Headphones", "price": "$100", "rating": "4.5"}
        result = productToReviewText(product)
        expected = "Name: Test Headphones\nPrice: $100\nRating: 4.5"
        assert result == expected


# Tests for the multiProductComparison function, which compares multiple products and identifies the best option
class TestMultiProductComparison:
    # Test successful comparison of multiple products
    @patch("productcomparator.main.b.CompareAnalysis")
    def testSuccessfulComparison(self, mockCompareAnalysis):
        # Setup mock response for BAML
        mockResponse = MagicMock()
        mockResponse.bestProduct = "Test Headphones 2"
        mockResponse.bestProductReason = "Better sound quality and battery life"
        mockCompareAnalysis.return_value = mockResponse

        analyses = [
            {
                "name": "Test Headphones 1",
                "price": "$100",
                "rating": "4.3",
                "categories": {"soundQuality": "Good", "batteryLife": "6 hours"},
            },
            {
                "name": "Test Headphones 2",
                "price": "$120",
                "rating": "4.8",
                "categories": {"soundQuality": "Excellent", "batteryLife": "10 hours"},
            },
        ]

        result = multiProductComparison(analyses)

        # Assertions to verify the comparison result
        assert result["bestProductName"] == "Test Headphones 2"
        assert result["bestProductReason"] == "Better sound quality and battery life"
        mockCompareAnalysis.assert_called_once()

    # Testing of the handling of errors during product comparison
    @patch("productcomparator.main.b.CompareAnalysis")
    def testComparisonError(self, mockCompareAnalysis):
        # Make a mock to simulate a BAML processing error
        mockCompareAnalysis.side_effect = Exception("BAML processing error")

        analyses = [
            {"name": "Product 1", "price": "$50", "rating": "4.0"},
            {"name": "Product 2", "price": "$60", "rating": "4.2"},
        ]

        result = multiProductComparison(analyses)

        # Check error handling
        assert "error" in result
        assert result["error"] == "Failed to extract multi-product comparison"
        assert "BAML processing error" in result["message"]


# Tests for the compareproducts endpoint, which allows comparing multiple products via the API
class TestCompareProductsEndpoint:
    # Testing of successful product comparison via the API endpoint
    @patch("productcomparator.main.multiProductComparison")
    def testSuccessfulComparison(self, mockMultiProductComparison, client):
        # Setup mock to return a successful comparison result
        mockMultiProductComparison.return_value = {
            "bestProductName": "Product B",
            "bestProductReason": "Better overall value",
        }

        requestData = {
            "analyses": [
                {"name": "Product A", "price": "$80", "rating": "4.1"},
                {"name": "Product B", "price": "$85", "rating": "4.5"},
            ]
        }

        # Call the endpoint
        response = client.post(
            "/compareproducts", json=requestData, content_type="application/json"
        )
        data = json.loads(response.data)

        # Assertions to verify the API response
        assert response.status_code == 200
        assert data["message"] == "Analyses compared successfully"
        assert data["comparison"]["bestProductName"] == "Product B"
        assert data["comparison"]["bestProductReason"] == "Better overall value"

    # Testing of the error handling within the product comparison API endpoint
    @patch("productcomparator.main.multiProductComparison")
    def testComparisonError(self, mockMultiProductComparison, client):
        # Setup mock to simulate a processing error
        mockMultiProductComparison.side_effect = Exception("Processing failed")

        requestData = {
            "analyses": [
                {"name": "Product A", "price": "$80", "rating": "4.1"},
                {"name": "Product B", "price": "$85", "rating": "4.5"},
            ]
        }

        # Call the endpoint being tested
        response = client.post(
            "/compareproducts", json=requestData, content_type="application/json"
        )
        data = json.loads(response.data)

        # Verify error response
        assert response.status_code == 500
        assert "error" in data
        assert "Processing failed" in data["error"]


# Tests for the saveproduct endpoint. Saves product information to the database
class TestSaveProductEndpoint:
    # Test saving a product to Firestore
    @patch("productcomparator.main.db.collection")
    def testSuccessfulSave(self, mockCollection, client):
        # Create mock document with ID
        mockDoc = MagicMock(id="generated-doc-id")

        # make mocks
        docRef = mockCollection.return_value.document.return_value
        collectionRef = docRef.collection.return_value
        collectionRef.add.return_value = (None, mockDoc)

        productData = {
            "userId": "test-user-123",
            "name": "Test Product",
            "price": "$99.99",
            "rating": "4.7",
        }

        # Send request
        response = client.post(
            "/saveproduct", json=productData, content_type="application/json"
        )
        data = json.loads(response.data)

        # Check response
        assert response.status_code == 201
        assert data["docId"] == "generated-doc-id"

        # Verify Firestore call
        collectionRef.add.assert_called_once_with(productData)

    # Error handling when saving a product fails
    @patch("productcomparator.main.db.collection")
    def testSaveError(self, mockCollection, client):
        # Make mock simulate a database connection error
        mockCollection.side_effect = Exception("Database connection error")

        productData = {
            "userId": "test-user-123",
            "name": "Test Product",
            "price": "$99.99",
        }

        # Call the endpoint
        response = client.post(
            "/saveproduct", json=productData, content_type="application/json"
        )
        data = json.loads(response.data)

        # Assertions to verify error handling
        assert response.status_code == 500
        assert "error" in data
        assert "Database connection error" in data["error"]


# Tests for the deleteproduct endpoint which removes saved products from the database
class TestDeleteProductEndpoint:
    # Test successfully deleting a product from Firestore
    @patch("productcomparator.main.db.collection")
    def testSuccessfulDelete(self, mockCollection, client):
        # Create mock document with ID
        mockDoc = MagicMock(id="product-doc-123")

        # make mocks
        docRef = mockCollection.return_value.document.return_value
        collectionRef = docRef.collection.return_value
        collectionRef.add.return_value = (None, mockDoc)

        deleteData = {"id": "product-doc-123", "userId": "test-user-123"}

        # Call the endpoint being tested
        response = client.post(
            "/deleteproduct", json=deleteData, content_type="application/json"
        )
        data = json.loads(response.data)

        # Check response
        assert response.status_code == 200
        assert data["message"] == "Product deleted successfully"

        # Verify Firestore call
        collectionRef.document.assert_called_once_with(deleteData["id"])
        collectionRef.document.return_value.delete.assert_called_once()

    # Error handling when deleting a product fails
    @patch("productcomparator.main.db.collection")
    def testDeleteError(self, mockCollection, client):
        # Setup mock to simulate database connection error
        mockCollection.side_effect = Exception("Database connection error")

        deleteData = {"id": "product-doc-123", "userId": "test-user-123"}

        # Call the endpoint being tested
        response = client.post(
            "/deleteproduct", json=deleteData, content_type="application/json"
        )
        data = json.loads(response.data)

        # Assertions to verify error handling
        assert response.status_code == 500
        assert "error" in data
        assert "Database connection error" in data["error"]


# Test for the response time of the microservice
class TestResponseTime:
    def testMicroserviceResponseTime(self, client):
        startTime = time.time()
        response = client.post(
            "/compareproducts",
            json={"analyses": [{"name": "Product A", "price": "$80", "rating": "4.1"}]},
            content_type="application/json",
        )
        responseTime = time.time() - startTime
        print(f"Response time: {responseTime:.5f} seconds")


if __name__ == "__main__":
    pytest.main()
