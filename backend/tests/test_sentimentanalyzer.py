import pytest
import json
from unittest.mock import patch, MagicMock
import sys
import os

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
from sentimentanalyzer.main import app, scrapeWebpage, scrapeWebpages, extractAnalysis


# Create a test client for Flask
@pytest.fixture
def client():
    with app.test_client() as client:
        yield client


# Tests for the scrapeWebpage function which extracts content from a single webpage
class TestScrapeWebpage:
    # Test successful webpage content extraction
    @patch("sentimentanalyzer.main.requests.get")
    @patch("sentimentanalyzer.main.extract")
    def testScrapeWebpageSuccess(self, mockExtract, mockGet):
        # Setup mocks for HTTP request and content extraction
        mockResponse = MagicMock()
        mockGet.return_value = mockResponse
        mockExtract.return_value = "Extracted content"

        result = scrapeWebpage("https://example.com")

        # Check for correct request handling and content extraction
        mockGet.assert_called_once_with("https://example.com")
        mockExtract.assert_called_once_with(mockResponse.content)
        assert result == "Extracted content"

    # Test error handling
    @patch("sentimentanalyzer.main.requests.get")
    def testScrapeWebpageFailure(self, mockGet):
        # Simulate a connection error
        mockGet.side_effect = Exception("Connection error")

        result = scrapeWebpage("https://example.com")

        assert result == ""


# Tests for the scrapeWebpages function which scrapes multiple webpages and combines their content
class TestScrapeWebpages:
    # Test scraping and combining content from multiple webpages
    @patch("sentimentanalyzer.main.scrapeWebpage")
    def testScrapeWebpages(self, mockScrapeWebpage):
        # Setup mock to return different content for each webpage
        mockScrapeWebpage.side_effect = ["Content 1", "Content 2", "Content 3"]

        links = ["https://example1.com", "https://example2.com", "https://example3.com"]
        result = scrapeWebpages(links)

        # Verify all pages were scraped and content was properly combined
        assert mockScrapeWebpage.call_count == 3
        assert result == "Content 1\nContent 2\nContent 3\n"


# Tests for the extractAnalysis function which analyzes product review content
class TestExtractAnalysis:
    # Test successful extraction of product analysis from review content
    @patch("sentimentanalyzer.main.b.AnalyzeProductReview")
    def testExtractAnalysisSuccess(self, mockAnalyze):
        # Setup mock with comprehensive product review analysis data
        mockResponse = MagicMock()
        mockResponse.name = "Test Headphones"
        mockResponse.summary = "Great headphones"
        mockResponse.price = "$100"
        mockResponse.priceSource = "Amazon"
        mockResponse.specifications = ["Wireless", "Bluetooth 5.0"]
        mockResponse.valueForMoney = "Good value"
        mockResponse.valueForMoneyRating = 4.5
        mockResponse.soundQuality = "Excellent"
        mockResponse.soundQualityRating = 4.8
        mockResponse.comfortFit = "Very comfortable"
        mockResponse.comfortFitRating = 4.6
        mockResponse.batteryLife = "8 hours"
        mockResponse.batteryLifeRating = 4.2
        mockResponse.connectivity = "Stable"
        mockResponse.connectivityRating = 4.3
        mockResponse.featuresControls = "Intuitive"
        mockResponse.featuresControlsRating = 4.1
        mockResponse.callQuality = "Clear"
        mockResponse.callQualityRating = 4.0
        mockResponse.brandWarranty = "1 year"
        mockResponse.brandWarrantyRating = 3.9
        mockResponse.userFeedback = "Mostly positive"
        mockResponse.userFeedbackRating = 4.4
        mockResponse.availability = "Widely available"
        mockResponse.availabilityRating = 4.7
        mockResponse.sentimentRating = 4.5
        mockResponse.sentiment = "Positive"

        mockAnalyze.return_value = mockResponse

        result = extractAnalysis("Sample review content")

        # Check for correct analysis extraction and formatting
        mockAnalyze.assert_called_once_with("Sample review content")
        assert result["name"] == "Test Headphones"
        assert result["summary"] == "Great headphones"
        assert result["price"] == "$100"
        assert result["valueForMoneyRating"] == 4.5
        assert result["sentiment"] == "Positive"

    # Test error handling
    @patch("sentimentanalyzer.main.b.AnalyzeProductReview")
    def testExtractAnalysisFailure(self, mockAnalyze):
        # Simulate analysis failure
        mockAnalyze.side_effect = Exception("Analysis failed")

        result = extractAnalysis("Sample review content")

        assert "error" in result
        assert result["error"] == "Failed to extract analysis"
        assert result["message"] == "Analysis failed"


# Tests for the analyzer endpoint
class TestAnalyzerEndpoint:
    # Test for when a product is not found
    @patch("sentimentanalyzer.main.db.collection")
    def testAnalyzerEndpointProductNotFound(self, mockCollection, client):
        # Return empty document list from database
        mockDocs = []
        mockCollection.return_value.stream.return_value = mockDocs

        response = client.get("/sentimentanalyzer?name=NotFoundProduct")

        assert response.status_code == 500
        assert "Internal Server Error" in str(response.data)

    # Test successful product analysis retrieval and processing
    @patch("sentimentanalyzer.main.db.collection")
    @patch("sentimentanalyzer.main.scrapeWebpages")
    @patch("sentimentanalyzer.main.extractAnalysis")
    def testAnalyzerEndpointSuccess(
        self, mockExtractAnalysis, mockScrapeWebpages, mockCollection, client
    ):
        # Mocks for database query, webpage scraping, and content analysis
        mockDoc = MagicMock()
        mockDoc.to_dict.return_value = {
            "name": "TestHeadphones",
            "links": ["https://example.com/review1", "https://example.com/review2"],
            "image": "https://example.com/image.jpg",
            "amazonLink": "https://amazon.com/product",
        }

        mockStream = MagicMock()
        mockStream.return_value = [mockDoc]
        mockCollection.return_value.stream = mockStream

        mockScrapeWebpages.return_value = "Combined review content"
        mockExtractAnalysis.return_value = {
            "name": "TestHeadphones",
            "summary": "Good headphones",
            "sentiment": "Positive",
            "sentimentRating": 4.2,
        }

        # Call with a valid product name
        response = client.get("/sentimentanalyzer?name=testheadphones")
        data = json.loads(response.data)

        # Assertions to verify correct response structure and content
        assert response.status_code == 200
        assert data["name"] == "TestHeadphones"
        assert data["links"] == [
            "https://example.com/review1",
            "https://example.com/review2",
        ]
        assert data["image"] == "https://example.com/image.jpg"
        assert data["amazonLink"] == "https://amazon.com/product"
        assert data["analysisContent"]["name"] == "TestHeadphones"
        assert data["analysisContent"]["sentiment"] == "Positive"

    # Test error handling in the analyzer endpoint
    @patch("sentimentanalyzer.main.db.collection")
    def testAnalyzerEndpointError(self, mockCollection, client):
        mockCollection.side_effect = Exception("Database error")

        response = client.get("/sentimentanalyzer?name=TestHeadphones")
        data = json.loads(response.data)

        assert response.status_code == 500
        assert "error" in data
        assert data["error"] == "Failed to analyze review"
        assert "message" in data


if __name__ == "__main__":
    pytest.main()
