import scrapy
from urllib.parse import urljoin

class CameraSpider(scrapy.Spider):
    # Name of the spider
    name = "cameraspider"

    # URLs for the spider
    start_urls = [
        "https://uk.pcmag.com/cameras-1",
        "https://www.cameralabs.com/camera-reviews/",
        "https://www.imaging-resource.com/compact-cameras",
        "https://www.imaging-resource.com/dslr-cameras",
        "https://www.imaging-resource.com/mirrorless-cameras",
        "https://www.imaging-resource.com/full-frame-cameras",
        "https://www.imaging-resource.com/waterproof-cameras",
        "https://photographylife.com/camera-reviews",
        "https://www.photographyblog.com/reviews"
    ]

    # Words to remove from the name of the product, e.g., "review"
    removeWords = [
    "review", "preview", "best", "for", "so", "far", "vs",
    "long term", "hands-on", "test", "first look", "comparison",
    "buying guide", "guide", "sample images", " –", "--",
    "/", "the", "best", "beginners", "travel", "waterproof", " p",
    "black", "mini", "system", "mark", "monochrom", "generation"
    ]


    # Method to parse the response
    def parse(self, response):
        # Check if the current page is from PCMag
        if "pcmag.com" in response.url:
            yield from self.parseCamReviews(response, "div.articlecontainer", "a::text", "a::attr(href)")
        # Check if the current page is from Camera Labs
        elif "cameralabs.com" in response.url:
            yield from self.parseCamReviews(response, "ul.lcp_catlist li", "a::text", "a::attr(href)")
        # Check if the current page is from Imaging Resource
        elif "imaging-resource.com" in response.url:
            yield from self.parseCamReviews(response, "a.product-name", "::text", "::attr(href)")
        # Check if the current page is from Photography Life
        elif "photographylife.com" in response.url:
            yield from self.parseCamReviews(response, "ol.rv li", "a::text", "a::attr(href)")
       


    # Method to parse the camera reviews
    def parseCamReviews(self, response, htmlTag, nameTag, linkTag):
        # Loop through each product container on the current page
        for product in response.css(htmlTag):
            # Extract the name and link of the product
            rawName = product.css(nameTag).get()
            # Remove specified words from the product name
            for word in self.removeWords:
                rawName = rawName.replace(word, "")
            # Clean up extra whitespace
            cleanName = rawName.strip()

            # Yield the cleaned data
            yield {
                "name": cleanName,
                "link": urljoin(response.url, product.css(linkTag).get()),  # Get URL for the product link
            }

        # Find the link to the next page using the `rel="next"` attribute
        nextPage = response.css('link[rel="next"]::attr(href)').get()
        if nextPage:
            nextPageURL = urljoin(response.url, nextPage)
            # Make a request to the next page and call the same `parse` method
            yield scrapy.Request(nextPageURL, callback=self.parse)
