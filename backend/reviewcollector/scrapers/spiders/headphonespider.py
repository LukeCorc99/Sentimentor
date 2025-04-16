import scrapy  # Import Scrapy framework for web crawling
from urllib.parse import urljoin  # Import urljoin to construct absolute URLs


# Define a Scrapy spider for crawling headphone review sites
class HeadphoneSpider(scrapy.Spider):
    name = "headphonespider"

    start_urls = [
        "https://www.whathifi.com/products/headphones",
        "https://www.techradar.com/audio/headphones/reviews",
        "https://www.headphonecheck.com/test/?fwp_khtypes=closed%2Cover-ear",
        "https://www.headphonecheck.com/test/?fwp_khtypes=in-ear%2Cclosed",
        "https://www.headfonia.com/category/headphones/",
        "https://uk.pcmag.com/headphones",
        "https://www.scarbir.com/truewireless",
        "https://www.expertreviews.com/uk/technology/audio/headphones",
        "https://www.engadget.com/reviews/headphones/",
    ]

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

    # Parsing method used for each URL. Targets selectors within the webpage to extract headphone reviews.
    # The method is called for each URL in the start_urls list.
    def parse(self, response):
        if "whathifi.com" in response.url:
            yield from self.parseHeadphoneReviews(
                response,
                "div.listingResults ",
                "div.listingResult",
                "div.listingResult",
                "a::attr(aria-label)",
                "a::attr(href)",
                "img::attr(src)",
                "div.flexi-pagination span.active + a::attr(href)",
            )

        elif "techradar.com" in response.url:
            yield from self.parseHeadphoneReviews(
                response,
                "div.listingResults ",
                "div.listingResult",
                "div.listingResult",
                "a::attr(aria-label)",
                "a::attr(href)",
                "img::attr(src)",
                "div.flexi-pagination span.active + a::attr(href)",
            )

        elif "headphonecheck.com" in response.url:
            yield from self.parseHeadphoneReviews(
                response,
                "div.facetwp-template",
                "article.entry.entry-test",
                "article.entry.entry-test",
                "h2.title a::text",
                "h2.title a::attr(href)",
                "div.image a img::attr(src)",
                "",  # Dynamically loaded
            )

        elif "uk.pcmag.com" in response.url:
            yield from self.parseHeadphoneReviews(
                response,
                "article.articlewrapper",
                "div.articlecontainer",
                "div.article-image",
                "a::text",
                "a::attr(href)",
                "a img::attr(src)",
                'link[rel="next"]::attr(href)',
            )

        elif "headfonia.com" in response.url:
            yield from self.parseHeadphoneReviews(
                response,
                "div.grids.masonry-layout.entries",
                "article",
                "article",
                "h2.entry-title a::text",
                "h2.entry-title a::attr(href)",
                "img::attr(src)",
                "ul.page-numbers a.next.page-numbers::attr(href)",
            )

        elif "expertreviews.com" in response.url:
            yield from self.parseHeadphoneReviews(
                response,
                "div.post-wrapper",
                "div.post-content",
                "div.post-thumbnail",
                "h5.post-title a::text",
                "h5.post-title a::attr(href)",
                "img::attr(src)",
                "a[aria-label='Next page']::attr(href)",
            )

        elif "scarbir.com" in response.url:
            yield from self.parseHeadphoneReviews(
                response,
                "div.row.sqs-row",
                "div.col.sqs-col-4.span-4",
                "div.col.sqs-col-4.span-4",
                "div.image-title.sqs-dynamic-text p::text",
                "div.intrinsic a::attr(href)",
                "div.intrinsic img::attr(src)",
                "a.next-page::attr(href)",
            )

        elif "engadget.com" in response.url:
            yield from self.parseHeadphoneReviews(
                response,
                "ul[class='D(b) Jc(sb) Flw(w) M(0) P(0) List(n)']",
                "li[class='Mb(24px) Bxz(bb)']",
                "li[class='Mb(24px) Bxz(bb)']",
                "a::attr(title)",
                "a::attr(href)",
                "img::attr(src)",
                "a[class='D(f) Ai(c) Jc(c) Bdrs(8px) Pstart(12px) Py(6px) Td(n) Fz(14px) Td(n) C(engadgetGray) Bgc(paginationHover):h']::attr(href)",
            )

    # Extracts product details from various review sites
    def parseHeadphoneReviews(
        self,
        response,
        htmlContainer,
        htmlChildren,
        htmlChildrenTwo,
        nameTag,
        linkTag,
        imgTag,
        nextPageTag,
    ):
        # Select elements containing product names, links, images
        nameLinkProducts = response.css(f"{htmlContainer} > {htmlChildren}")
        imageProducts = response.css(f"{htmlContainer} > {htmlChildrenTwo}")

        # Loop through name and image elements in parallel
        for nameProduct, imageProduct in zip(nameLinkProducts, imageProducts):
            # Extract and clean product name
            rawName = nameProduct.css(nameTag).get()
            if rawName:
                for word in self.removeWords:
                    rawName = rawName.replace(word, "")
                cleanName = rawName.strip()

                # Extract and normalize product link
                productLink = nameProduct.css(linkTag).get()
                if productLink:
                    productLink = urljoin(response.url, productLink)
                else:
                    productLink = None

                # Extract and normalize product image URL
                imageURL = imageProduct.css(imgTag).get()
                if imageURL:
                    imageURL = urljoin(response.url, imageURL)
                else:
                    imageURL = None

                # Yield structured product data
                yield {
                    "name": cleanName,
                    "link": productLink,
                    "image": imageURL,
                }

        # Check if there's a link to the next page of results
        nextPage = response.css(nextPageTag).get()
        if nextPage:
            nextPageURL = urljoin(response.url, nextPage)
            yield scrapy.Request(
                nextPageURL, callback=self.parse
            )  # Schedule another request to crawl the next page
