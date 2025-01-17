import pytest
from scrapy.http import HtmlResponse
from reviewcollector.reviewcollector.spiders.cameraspider import CameraSpider
from reviewcollector.reviewcollector.spiders.televisionspider import TelevisionSpider


# Fixture to initialize the CameraSpider instance for testing
@pytest.fixture
def camera_spider():
    """Fixture for CameraSpider."""
    return CameraSpider()


# Fixture to initialize the TelevisionSpider instance for testing
@pytest.fixture
def television_spider():
    """Fixture for TelevisionSpider."""
    return TelevisionSpider()


def test_camera_spider_parse(camera_spider):
    """
    Test parsing functionality of CameraSpider.
    Verifies that the spider can correctly parse HTML content for camera reviews.
    """
    # Sample HTML mimicking a webpage with camera review links
    sample_html = """
    <html>
        <body>
            <div class="articlecontainer">
                <a href="/review1">Camera A review</a>
            </div>
            <div class="articlecontainer">
                <a href="/review2">Camera B review</a>
            </div>
        </body>
    </html>
    """
    # Create a mock response object with the sample HTML and a test URL
    response = HtmlResponse(
        url="https://uk.pcmag.com/cameras-1", body=sample_html, encoding="utf-8"
    )
    # Call the spider's parse method and collect the results
    results = list(camera_spider.parse(response))

    # Assert that two items were extracted
    assert len(results) == 2
    # Validate the extracted product names and links
    assert results[0]["name"] == "Camera A"
    assert results[0]["link"] == "https://uk.pcmag.com/review1"
    assert results[1]["name"] == "Camera B"
    assert results[1]["link"] == "https://uk.pcmag.com/review2"


def test_television_spider_parse(television_spider):
    """
    Test parsing functionality of TelevisionSpider.
    Verifies that the spider can correctly parse HTML content for television reviews.
    """
    # Sample HTML mimicking a webpage with television review links
    sample_html = """
    <html>
        <body>
            <div class="articlecontainer">
                <a href="/tv-review1">Television A Review</a>
            </div>
            <div class="articlecontainer">
                <a href="/tv-review2">Television B Review</a>
            </div>
        </body>
    </html>
    """
    # Create a mock response object with the sample HTML and a test URL
    response = HtmlResponse(
        url="https://uk.pcmag.com/tvs", body=sample_html, encoding="utf-8"
    )
    # Call the spider's parse method and collect the results
    results = list(television_spider.parse(response))

    # Assert that two items were extracted
    assert len(results) == 2
    # Validate the extracted product names and links, ensuring 'Review' is removed
    assert results[0]["name"] == "Television A"
    assert results[0]["link"] == "https://uk.pcmag.com/tv-review1"
    assert results[1]["name"] == "Television B"
    assert results[1]["link"] == "https://uk.pcmag.com/tv-review2"
