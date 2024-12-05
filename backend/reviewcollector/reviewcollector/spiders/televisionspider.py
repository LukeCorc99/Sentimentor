import scrapy
from urllib.parse import urljoin


class TelevisionSpider(scrapy.Spider):
    # Name of the spider
    name = "televisionspider"

    # URLs for the spider
    start_urls = ["https://uk.pcmag.com/tvs"]

    # Words to remove from the name of the product, e.g., "review"
    removeWords = [
        "review",
        "preview",
        "best",
        "for",
        "so",
        "far",
        "vs",
    ]

    # Method to parse the response
    def parse(self, response):
        # Check if the current page is from PCMag
        if "pcmag.com" in response.url:
            yield from self.parseTelevisionReviews(
                response, "div.articlecontainer", "a::text", "a::attr(href)"
            )

    # Method to parse the television reviews
    def parseTelevisionReviews(self, response, htmlTag, nameTag, linkTag):
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
                "link": urljoin(
                    response.url, product.css(linkTag).get()
                ),  # Get URL for the product link
            }

        # Find the link to the next page using the `rel="next"` attribute
        nextPage = response.css('link[rel="next"]::attr(href)').get()
        if nextPage:
            nextPageURL = urljoin(response.url, nextPage)
            # Make a request to the next page and call the same `parse` method
            yield scrapy.Request(nextPageURL, callback=self.parse)
