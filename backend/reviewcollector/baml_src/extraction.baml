class Reviews {
  productReviewURLs string[]
}

class Product {
  productNames string[]
}

function ExtractProductName(names: string[]) -> Product {
  client "openai/gpt-4o-mini"
  prompt #"
    View the list of product review titles within the 'names' input and decipher which product is being reviewed in each title.

    {{ names }}

    - Find each product that is mentioned in each product review title, and return the name of those products.
    - If the retained name(s) is not of an actual product (e.g. Noise-Cancelling Headphones is not an actual product (so do not return it),
     but Samsung Galaxy Buds 2 is (so do return it)), return nothing.
    - Order the product names alphabetically.
    - Make sure all returned product names are specific and not generic, e.g. 'Sennheiser headphones' and 'AirPods' is too generic, but
    'Sony WH-1000XM4' is specific.

    {{ ctx.output_format }}
  "#
}

function ExtractProductReviewLinks(name: string, links: string[]) -> Reviews {
  client "openai/gpt-4o"
  prompt #"
View the list of product review URLs below and identify which ones are reviewing the product in the `name` input. Return a list of 
all the URLs that are reviewing the product. 

- Do not include any URLs which are not reviews of the product mentioned in the `name` input.
- If the product name in the `name` input is a generic term (e.g. 'headphones'), or is not a specific product model (e.g. 'Sony headphones'),
return an empty list.
- Do not include any URLs which are reviews of variations of the product mentioned in the `name` input (e.g. if the product name is 'Samsung Galaxy Buds', do not include
'Samsung Galaxy Buds Plus' or 'Samsung Galaxy Buds Pro').
- Make sure each URL is a review of the exact same product, e.g. 'Samsung Galaxy Buds' and 'Samsung Galaxy Buds Plus' are different models and should not be included together.

{{ links }}
{{ name }}

{{ ctx.output_format }}

"#
}




test extractProductNamesTest {
  functions [ExtractProductName]
  args {
    names [
      "Best noise-cancelling headphones 2025 – tested by our in-house experts", "Best Sennheiser headphones 2025: 7 brilliant options tested by our team", "The  AirPods alternatives 2025: choice pairs ed by 
our experts", "I tested the Bose QuietComt headphones and the noise-cancelling is still flagship quality –\u{a0}but that's not the full story", "The Best Headphones  2025", "The Best Noise-Cancelling Headphones  2025", "The  noise-cancelling earbuds in 2024", "Beats' latest running headphones promise a lighter fit, improved und and the brand's \"-ever\" noise-cancelling", "Best AirPods Max alternatives 2025: 
amazing options picked by our experts", "Best Bose headphones 2025: noise-cancelling and wireless models tested by our experts", "Best headphones with a mic 2025: top options  music and calls tested", "Best noise-cancelling earbuds 2025", "Best Sony headphones 2025: top pairs recommended by our expert s team", "Best wireless headphones 2025: ed and rated by our in-house experts", "Best budget wireless earbuds 2025: top afdable pairs tested by our experts", "Best on-ear headphones 2025: our expert pick of wired and wireless pairs", "Best wired headphones 2025: the 7 top pairs tested by our  experts", "Best cheap headphones 2025: great music quality on a budget", "Best in-ear headphones 2025: top earbuds tried and tested by our experts",
 "Best cheap noise-cancelling headphones 2025: expert-tested recommendations", 
"The  cheap noise-cancelling headphones", "Best iPhone headphones 2025: budget to premium, tested by experts", "Best wireless earbuds 2025: top pairs tested by our ers", "Best Beats headphones 2025: top pairs tested by experts", "Best headphones 2025 – our expert picks of every type", "Best cheap wireless headphones 2025, tested by our experts", "Best sports and workout headphones 2025: top earbuds  keeping active", "Best running headphones and wireless earbuds 2025: tested on the road and in the gym", "Bowers & Wilkins PX: Noise-cancelling headphones with style", "Lindy BNX-100: Afdable noise-cancelling headphones", "Philips SHB9850NC: Great-value noise-cancelling headphones"]
    
  }
}



test extractProductReviewsTest {
  functions [ExtractProductReviewLinks]
  args {
    name #"
      Samsung Galaxy Buds
    "#
    links [
      "https://www.scarbir.com/tws/samsung-galaxy-buds-fe-review",
      "https://www.scarbir.com/tws/redmi-buds-6-play-vs-lite-vs-baseus-e19",
      "https://www.scarbir.com/tws/realme-buds-air-5-pro-vs-redmi-buds-5-pro-review",
      "https://www.scarbir.com/tws/samsung-galaxy-buds-plus-review-2021",
      "https://www.scarbir.com/tws/samsung-galaxy-buds-2-vs-tinhifi-tinbuds-3-review",
      "https://www.scarbir.com/tws/samsung-galaxy-buds-live-2022-review",
      "https://www.expertreviews.com/uk/technology/audio/headphones/seven-reasons-you-should-buy-the-samsung-galaxy-buds-fe",
      "https://www.scarbir.com/tws/cheapest-airpods-like-earbuds-aliexpress",
      "https://www.engadget.com/samsung-galaxy-buds-3-and-galaxy-buds-3-pro-review-airpods-clones-that-actually-deliver-171024116.html",
      "https://www.engadget.com/samsung-galaxy-buds-2-review-150002889.html",
      "https://www.techradar.com/audio/earbuds-airpods/samsung-galaxy-buds-3-pro-review",
      "https://www.expertreviews.com/uk/samsung/1414307/samsung-galaxy-buds-2-review",
      "https://www.expertreviews.com/uk/samsung/samsung-galaxy-buds-fe-review",
      "https://www.engadget.com/samsung-galaxy-buds-live-review-140007680.html",
      "https://www.expertreviews.com/uk/headphones/the-four-star-samsung-galaxy-buds2-pro-are-the-cheapest-theyve-ever-been-in-amazons-spring-sale",
      "https://www.engadget.com/2019-03-13-samsung-galaxy-buds-review-true-wireless-earbuds.html",
      "https://uk.pcmag.com/headphones/153678/samsung-galaxy-buds-3",
      "https://uk.pcmag.com/headphones/153545/samsung-galaxy-buds-3-pro",
      "https://www.expertreviews.com/uk/samsung/1416829/samsung-galaxy-buds2-pro-review",
      "https://www.expertreviews.com/uk/samsung/1412397/samsung-galaxy-buds-live-review",
      "https://www.expertreviews.com/uk/headphones/1416566/samsung-galaxy-buds-2-pro-preview",
      "https://www.whathifi.com/headphones/wireless-earbuds/the-galaxy-buds-3-pro-drop-to-an-unbelievable-gbp140-get-them-while-you-can",
      "https://www.expertreviews.com/uk/samsung/1413130/samsung-galaxy-buds-pro-review",
      "https://www.whathifi.com/reviews/samsung-galaxy-buds-3-pro",
      "https://www.expertreviews.com/uk/samsung/1408804/samsung-galaxy-buds-review",
      "https://www.expertreviews.com/uk/samsung/1411699/samsung-galaxy-buds-plus-review",
      "https://www.expertreviews.com/uk/tvs-entertainment/headphones/1401854/samsung-level-over-review"
    ]
  }
}







