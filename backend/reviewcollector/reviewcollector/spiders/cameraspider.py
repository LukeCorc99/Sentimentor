import scrapy
from urllib.parse import urljoin

class CameraSpider(scrapy.Spider):
    name = 'cameraspider'
    start_urls = ['https://uk.pcmag.com/cameras-1']

    def parse(self, response):
        for products in response.css('div.articlecontainer'):
            yield {
                'name': products.css('a::text').get(),
                'link': urljoin(self.start_urls[0], products.css('a::attr(href)').get()),
            }
