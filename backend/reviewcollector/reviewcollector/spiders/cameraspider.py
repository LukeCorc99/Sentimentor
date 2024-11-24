import scrapy
from urllib.parse import urljoin  # For creating absolute URLs from relative ones


class CameraSpider(scrapy.Spider):
    # Name of the spider
    name = "cameraspider"

    # Starting URL for the spider
    start_urls = ["https://uk.pcmag.com/cameras-1"]

    # Main parsing method that handles the response from each page
    def parse(self, response):
        """
        This method is called to handle the content of each page.
        It extracts camera data and follows pagination links.
        """
        # Loop through each product container on the current page
        for product in response.css("div.articlecontainer"):
            # Extract the name and link of the product
            yield {
                "name": product.css("a::text").get(),  # Get the product name
                "link": urljoin(response.url, product.css("a::attr(href)").get()),  # Create an absolute URL for the product link
            }

        # Find the link to the next page using the `rel="next"` attribute
        next_page = response.css('link[rel="next"]::attr(href)').get()
        if next_page:
            # If a next page is found, construct the absolute URL
            next_page_url = urljoin(response.url, next_page)
            
            # Log the URL of the next page for debugging purposes
            self.logger.info(f"Following next page: {next_page_url}")
            
            # Make a request to the next page and call the same `parse` method
            yield scrapy.Request(next_page_url, callback=self.parse)



