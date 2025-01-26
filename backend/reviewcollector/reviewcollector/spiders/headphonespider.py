import scrapy
from urllib.parse import urljoin


class HeadphoneSpider(scrapy.Spider):
    # Name of the spider
    name = "headphonespider"

    # URLs for the spider
    start_urls = [
        "https://www.whathifi.com/products/headphones",
        "https://www.techradar.com/audio/headphones/reviews",
        "https://www.headphonecheck.com/test/?fwp_khtypes=closed%2Cover-ear",
        "https://www.headphonecheck.com/test/?fwp_khtypes=in-ear%2Cclosed",
        "https://www.headfonia.com/category/headphones/",
        "https://uk.pcmag.com/headphones",
        "https://www.scarbir.com/truewireless",
    ]

    # Words to remove from the name of the product, e.g., "review"
    removeWords = [
        "review",
        "Review",
        "preview",
        "best",
        "for",
        "so",
        "far",
        "vs",
    ]

    # Method to parse the response
    def parse(self, response):
        # Check if the current page is from WhatHiFi
        if "whathifi.com" in response.url:
            yield from self.parseHeadphoneReviews(
                response,
                "div.listingResults ",
                "div.listingResult",
                "a::attr(aria-label)",
                "a::attr(href)",
                'link[rel="next"]::attr(href)',
            )

        # Check if the current page is from TechRadar
        elif "techradar.com" in response.url:
            yield from self.parseHeadphoneReviews(
                response,
                "div.listingResults ",
                "div.listingResult",
                "a::attr(aria-label)",
                "a::attr(href)",
                "div.flexi-pagination span.active + a::attr(href)",
            )

        # Check if the current page is from HeadphoneCheck
        elif "headphonecheck.com" in response.url:
            yield from self.parseHeadphoneReviews(
                response,
                "div.facetwp-template",
                "article.entry.entry-test",
                "h2.title a::text",
                "h2.title a::attr(href)",
                "",
            )

        # Check if the current page is from PCMag
        elif "uk.pcmag.com" in response.url:
            yield from self.parseHeadphoneReviews(
                response,
                "article.articlewrapper",
                "div.articlecontainer",
                "a::text",
                "a::attr(href)",
                'link[rel="next"]::attr(href)',
            )

        # Check if the current page is from Headfonia
        elif "headfonia.com" in response.url:
            yield from self.parseHeadphoneReviews(
                response,
                "div.grids.masonry-layout.entries",
                "article",
                "h2.entry-title a::text",
                "h2.entry-title a::attr(href)",
                "ul.page-numbers a.next.page-numbers::attr(href)",
            )

        # Check if the current page is from Scarbir
        elif "scarbir.com" in response.url:
            yield from self.parseScarbir(response)

    # Method to parse the headphone reviews
    def parseHeadphoneReviews(
        self, response, htmlContainer, htmlChildren, nameTag, linkTag, nextPageTag
    ):
        # Iterate through each product within the specified container by targeting its child elements using the provided CSS selectors.
        for product in response.css(f"{htmlContainer} > {htmlChildren}"):
            # Extract the name and link of the product
            rawName = product.css(nameTag).get()
            if rawName:
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
            else:
                self.logger.info("No next page found.")

        # Find the link to the next page
        nextPage = response.css(nextPageTag).get()
        # Check if the next page exists
        if nextPage:
            # Construct the full URL for the next page
            nextPageURL = urljoin(response.url, nextPage)
            # Make a request to the next page and call the same `parse` method
            yield scrapy.Request(nextPageURL, callback=self.parse)

    # Method to parse the Scarbir website
    def parseScarbir(self, response):
        # Define the first set of CSS selectors
        selectorsOne = {
            "container": "div.row.sqs-row",
            "children": "div.col.sqs-col-4.span-4",
            "name": "div.image-title.sqs-dynamic-text p::text",
            "link": "div.intrinsic a::attr(href)",
            "next": "a.next-page::attr(href)",
        }

        # Define the second set of CSS selectors
        selectorsTwo = {
            "container": "div.row.sqs-row",
            "children": "div.col.sqs-col-3.span-3",
            "name": "div.image-title.sqs-dynamic-text p::text",
            "link": "div.intrinsic a::attr(href)",
            "next": "a.next-page::attr(href)",
        }

        # Use parseHeadphoneReviews for both sets
        for selectors in [selectorsOne, selectorsTwo]:
            yield from self.parseHeadphoneReviews(
                response,
                selectors["container"],
                selectors["children"],
                selectors["name"],
                selectors["link"],
                selectors["next"],
            )
