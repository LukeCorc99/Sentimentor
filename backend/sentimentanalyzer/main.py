from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json
from trafilatura import extract
from dotenv import load_dotenv
import os
import sys

# Load environment variables from .env file
load_dotenv()

# Add the project root directory to sys.path for BAML client access
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
# Import the BAML client library
from baml_client.sync_client import b

# Create a new Flask application instance
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) for the app, allowing all origins
cors = CORS(app, origins="*")

# Load camera reviews from the JSON file
def loadCameraReviews():
    with open("../../frontend/public/camerareviews.json", "r") as file:
        return json.load(file)

# Scrape all text from a webpage.
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


def extractAnalysis(content):
    try:
        response = b.AnalyzeProductReview(content)
        return {
            "summary": response.summary,
            "score": response.score,
            "pros": response.pros,
            "cons": response.cons,
        }
    except Exception as e:
        return {"error": "Failed to extract analysis", "message": str(e)}


# Define a route for the endpoint, accepting GET requests
@app.route("/sentimentanalyzer", methods=["GET"])
def analyzer():
    cameraName = request.args.get(
        "name", ""
    )  # Get the name from the request query parameters.
    try:
        reviews = loadCameraReviews()
        # Search for the review associated with the specified name
        for review in reviews:
            if review["name"].lower() == cameraName.lower():
                # Scrape the webpage associated with the link
                webpageText = scrapeWebpage(review["link"])
                
                # Extract analysis information using BAML
                analysisContent = extractAnalysis(webpageText)
                
                return jsonify(
                    {
                        "name": review["name"],
                        "link": review["link"],
                        "analysisContent": analysisContent,
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
