import pytest
import json
from unittest.mock import patch, MagicMock, mock_open
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
from reviewcollector.main import (
    app,
    extractProductName,
    extractProductReviewLinks,
    loadHeadphoneReviews,
    getImageUsingLink,
    groupReviews,
    getAmazonLink,
)


# Create a test client for Flask
@pytest.fixture
def client():
    with app.test_client() as client:
        yield client


# Fixture to provide sample review data for testing
@pytest.fixture
def sampleReviews():
    return [
        {
            "name": "Sony WH-1000XM4 Wireless Noise-Canceling Headphones",
            "link": "https://example.com/reviews/sony-wh-1000xm4",
            "image": "https://example.com/images/sony-wh-1000xm4.jpg",
        },
        {
            "name": "Sony WH1000XM4 Noise Cancelling Headphones",
            "link": "https://example.com/reviews/sony-wh1000xm4-2",
            "image": "https://example.com/images/sony-wh1000xm4-2.jpg",
        },
        {
            "name": "Bose QuietComfort 45 Wireless Headphones",
            "link": "https://example.com/reviews/bose-qc45",
            "image": "https://example.com/images/bose-qc45.jpg",
        },
        {
            "name": "Bose QC 45 Noise Cancelling Headphones",
            "link": "https://example.com/reviews/bose-quietcomfort-45",
            "image": "https://example.com/images/bose-qc-45.jpg",
        },
        {
            "name": "Apple AirPods Max",
            "link": "https://example.com/reviews/airpods-max",
            "image": "https://example.com/images/airpods-max.jpg",
        },
    ]


# Tests for the extractProductName function which parses product names from article titles
class TestExtractProductName:
    # Test successful extraction of product names
    @patch("reviewcollector.main.b.ExtractProductName")
    def testExtractProductNameSuccess(self, mockExtractProductName):
        # Setup mock response for the BAML ExtractProductName method
        mockResponse = MagicMock()
        mockResponse.productNames = ["Sony WH-1000XM4"]
        mockExtractProductName.return_value = mockResponse

        # Call ExtractProductName with sample article titles
        titles = ["Sony WH-1000XM4 Wireless", "Sony WH1000XM4 Review"]
        result = extractProductName(titles)

        # Check correct product name extraction
        mockExtractProductName.assert_called_once_with(titles)
        assert "names" in result
        assert result["names"] == ["Sony WH-1000XM4"]

    # Test error handling when extracting product names fails
    @patch("reviewcollector.main.b.ExtractProductName")
    def testExtractProductNameFailure(self, mockExtractProductName):
        # Setup mock to simulate a BAML error
        mockExtractProductName.side_effect = Exception("BAML processing error")

        titles = ["Sony WH-1000XM4 Wireless", "Sony WH1000XM4 Review"]
        result = extractProductName(titles)

        # Check error handling
        assert "error" in result
        assert result["error"] == "Failed to extract name"
        assert "BAML processing error" in result["message"]


# Tests for the extractProductReviewLinks function which identifies relevant review links for a product
class TestExtractProductReviewLinks:
    # Test successful extraction of product review links
    @patch("reviewcollector.main.b.ExtractProductReviewLinks")
    def testExtractProductReviewLinksSuccess(self, mockExtractProductReviewLinks):
        # Mock response for the BAML ExtractProductReviewLinks method
        mockResponse = MagicMock()
        mockResponse.productReviewURLs = [
            "https://example.com/reviews/sony-wh-1000xm4",
            "https://example.com/reviews/sony-wh1000xm4-2",
        ]
        mockExtractProductReviewLinks.return_value = mockResponse

        name = "Sony WH-1000XM4"
        links = [
            "https://example.com/reviews/sony-wh-1000xm4",
            "https://example.com/reviews/sony-wh1000xm4-2",
            "https://example.com/reviews/other-product",
        ]
        result = extractProductReviewLinks(name, links)

        # Verify for correct link extraction
        mockExtractProductReviewLinks.assert_called_once_with(name, links)
        assert "links" in result
        assert len(result["links"]) == 2
        assert "https://example.com/reviews/sony-wh-1000xm4" in result["links"]

    # Test error handling when extracting product review links fails
    @patch("reviewcollector.main.b.ExtractProductReviewLinks")
    def testExtractProductReviewLinksFailure(self, mockExtractProductReviewLinks):
        # Mock to simulate a BAML processing error
        mockExtractProductReviewLinks.side_effect = Exception("BAML processing error")

        name = "Sony WH-1000XM4"
        links = ["https://example.com/reviews/sony-wh-1000xm4"]
        result = extractProductReviewLinks(name, links)

        assert "error" in result
        assert result["error"] == "Failed to extract links"
        assert "BAML processing error" in result["message"]


# Tests for the loadHeadphoneReviews function which loads review data from the JSON file
class TestLoadHeadphoneReviews:
    # Test loading reviews from a JSON file
    @patch(
        "builtins.open",
        new_callable=mock_open,
        read_data='[{"name": "Test Headphones", "link": "https://example.com", "image": "https://example.com/image.jpg"}]',
    )
    def testLoadHeadphoneReviews(self, mockOpen):
        result = loadHeadphoneReviews()

        # Check for correct file loading and data parsing
        mockOpen.assert_called_once_with(
            "../../frontend/public/headphonereviews.json", "r", encoding="utf-8"
        )
        assert isinstance(result, list)
        assert len(result) == 1
        assert result[0]["name"] == "Test Headphones"
        assert result[0]["link"] == "https://example.com"
        assert result[0]["image"] == "https://example.com/image.jpg"


# Tests for the getImageUsingLink function which retrieves product images based on review links
class TestGetImageUsingLink:
    # Finding an image when the link exists in the data
    def testGetImageUsingLinkFound(self, sampleReviews):
        # Setup mock to return sample review data
        with patch(
            "reviewcollector.main.loadHeadphoneReviews", return_value=sampleReviews
        ):
            result = getImageUsingLink("https://example.com/reviews/sony-wh-1000xm4")

            # Assertion to verify that the image is retrieved
            assert result == "https://example.com/images/sony-wh-1000xm4.jpg"

    # Test behavior when the link doesn't exist in the data
    def testGetImageUsingLinkNotFound(self, sampleReviews):
        with patch(
            "reviewcollector.main.loadHeadphoneReviews", return_value=sampleReviews
        ):
            # Call getImageUsingLink with a non-existent link
            result = getImageUsingLink("https://example.com/non-existent-review")

            # Make sure the result is None when the link is not found
            assert result is None


# Tests for the groupReviews function which groups similar reviews using fuzzy matching
class TestGroupReviews:
    # Test grouping reviews with similar product names
    @patch("reviewcollector.main.process.extractOne")
    def testGroupReviewsWithMatches(self, mockExtractOne, sampleReviews):
        # Setup mock behavior for fuzzy matching with specific match scenarios. Simulates fuzzywuzzy's process.extractOne function.
        def mockExtractSideEffect(title, names, scorer, score_cutoff):
            if (
                title == "Sony WH1000XM4 Noise Cancelling Headphones"
                and "Sony WH-1000XM4 Wireless Noise-Canceling Headphones" in names
            ):
                return ["Sony WH-1000XM4 Wireless Noise-Canceling Headphones", 85]
            elif (
                title == "Bose QC 45 Noise Cancelling Headphones"
                and "Bose QuietComfort 45 Wireless Headphones" in names
            ):
                return ["Bose QuietComfort 45 Wireless Headphones", 80]
            else:
                return None

        # Set the side effect of the mock to simulate fuzzy matching behavior
        mockExtractOne.side_effect = mockExtractSideEffect

        result = groupReviews(sampleReviews)

        # Should have 2 groups (Sony and Bose)
        assert len(result) == 2

        # Check if each group has the expected content
        sony_group = next((g for g in result if "Sony" in g["names"][0]), None)
        bose_group = next((g for g in result if "Bose" in g["names"][0]), None)

        assert sony_group is not None
        assert len(sony_group["names"]) == 2
        assert len(sony_group["links"]) == 2

        assert bose_group is not None
        assert len(bose_group["names"]) == 2
        assert len(bose_group["links"]) == 2

    # Test for when no similar reviews are found
    def testGroupReviewsNoMatches(self):
        # Sample data with unique titles where no matches are expected
        uniqueReviews = [
            {"name": "Sony WH-1000XM4", "link": "https://example.com/sony"},
            {"name": "Bose QC45", "link": "https://example.com/bose"},
            {"name": "Apple AirPods Max", "link": "https://example.com/apple"},
        ]

        # Mock the fuzzy matching to return None for all comparisons
        with patch("reviewcollector.main.process.extractOne", return_value=None):
            result = groupReviews(uniqueReviews)

            # No groups with 2+ entries should be formed
            assert len(result) == 0


# Tests for the getAmazonLink function which generates Amazon search URLs for products
class TestGetAmazonLink:
    # Test creating Amazon search URLs for products
    def testGetAmazonLink(self):
        result = getAmazonLink("Sony WH-1000XM4")

        assert result == "https://www.amazon.com/s?k=Sony%20WH-1000XM4"

        # Test with a product name containing special characters
        result = getAmazonLink("Headphones & Earbuds")
        assert result == "https://www.amazon.com/s?k=Headphones%20%26%20Earbuds"


# Tests for product reviews endpoint
class TestProductReviewsEndpoint:
    # Test successful request to the product reviews endpoint
    @patch("reviewcollector.main.loadHeadphoneReviews")
    @patch("reviewcollector.main.groupReviews")
    def testProductReviewsSuccess(
        self, mockGroupReviews, mockLoadHeadphoneReviews, client, sampleReviews
    ):
        # Mock for review data and grouping
        mockLoadHeadphoneReviews.return_value = sampleReviews

        groupedReviews = [
            {
                "names": [
                    "Sony WH-1000XM4 Wireless Noise-Canceling Headphones",
                    "Sony WH1000XM4 Noise Cancelling Headphones",
                ],
                "links": [
                    "https://example.com/reviews/sony-wh-1000xm4",
                    "https://example.com/reviews/sony-wh1000xm4-2",
                ],
            },
            {
                "names": [
                    "Bose QuietComfort 45 Wireless Headphones",
                    "Bose QC 45 Noise Cancelling Headphones",
                ],
                "links": [
                    "https://example.com/reviews/bose-qc45",
                    "https://example.com/reviews/bose-quietcomfort-45",
                ],
            },
        ]
        mockGroupReviews.return_value = groupedReviews

        response = client.get("/productreviews")
        data = json.loads(response.data)

        # Verify correct API responses
        assert response.status_code == 200
        assert len(data) == 2
        assert "Sony" in data[0]["names"][0]
        assert "Bose" in data[1]["names"][0]

    # Test error handling
    @patch("reviewcollector.main.loadHeadphoneReviews")
    def testProductReviewsError(self, mockLoadHeadphoneReviews, client):
        # Simulate file not found error
        mockLoadHeadphoneReviews.side_effect = Exception("File not found")

        response = client.get("/productreviews")
        data = json.loads(response.data)

        # check error handling
        assert response.status_code == 500
        assert "error" in data
        assert "File not found" in data["error"]


if __name__ == "__main__":
    pytest.main()
