from flask import Flask, jsonify, request
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import requests
import json
from trafilatura import extract


# Create a new Flask application instance
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) for the app, allowing all origins
cors = CORS(app, origins="*")

# This hugging face pre-trained model is used for sentiment analysis in multiple languages, tailored to product reviews. It runs on PyTorch by default.
modelName = "nlptown/bert-base-multilingual-uncased-sentiment"
# Load the tokenizer. This tokenizer is used to preprocess the text data before feeding it to the model.
tokenizer = AutoTokenizer.from_pretrained(modelName)
# Load the model. This model is used to predict the sentiment of the preprocessed text data.
model = AutoModelForSequenceClassification.from_pretrained(modelName)

# Use a Hugging Face pipeline as it abstracts a lot of the complexity of NLP tasks.
sentimentPipeline = pipeline("sentiment-analysis", model=model, tokenizer=tokenizer)

# For testing purposes
goodCamera = "Fujifilm X100VI"
badCamera = "Polaroid Go Generation 2"
mediocreCamera = "Leica D-Lux 8"


# Load camera reviews from the JSON file
def loadCameraReviews():
    with open("../../frontend/public/camerareviews.json", "r") as file:
        return json.load(file)


# Scrape all text from a webpage. Uses BeautifulSoup instead of Scrapy to extract text from the entire webpage instead of specific elements.
def scrapeWebpage(link):
    # Send a GET request to the webpage
    response = requests.get(link)
    response.raise_for_status()  # Return an error for bad status codes

    # Extract the main text content from the webpage using Trafilatura
    extractedContent = extract(response.content)
    if extractedContent:
        return extractedContent
    else:
        return "ERROR: No content extracted"


# Define a route for the endpoint, accepting GET requests
@app.route("/sentimentanalyzer", methods=["GET"])
def analyzer():
    cameraName = request.args.get("name", "")  # Get the name from the request query parameters.
    try:
        reviews = loadCameraReviews()
        # Search for the review associated with the specified name
        for review in reviews:
            if review["name"].lower() == cameraName.lower():
                # Scrape the webpage associated with the link
                webpageText = scrapeWebpage(review["link"])
                # Analyze the sentiment of the scraped text. Set a limit of 512 tokens to avoid exceeding the model's input limit.
                result = sentimentPipeline(webpageText[:512])
                return jsonify(
                    {
                        "name": review["name"],
                        "link": review["link"],
                        "sentiment": result,
                        "webpageText": webpageText,
                    }
                )
    except Exception as e:
        return (
            jsonify({"error": "Failed to analyze review", "message": str(e)}),
            500,
        )


# Check if the script is being run directly
if __name__ == "__main__":
    app.run(debug=True, port=8081)
