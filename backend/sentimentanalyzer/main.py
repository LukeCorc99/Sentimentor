from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from trafilatura import extract
from dotenv import load_dotenv
import os
import sys
import json
import firebase_admin
from firebase_admin import credentials, firestore

# Load environment variables from .env file
load_dotenv()

# Get Firebase credentials from environment variable
firebaseCredentials = os.getenv("FIREBASE_CREDENTIALS")
# Parse the JSON string into a dictionary
credDict = json.loads(firebaseCredentials)

# Initialize Firebase using the credentials
cred = credentials.Certificate(credDict)
firebase_admin.initialize_app(cred)

# Access Firestore
db = firestore.client()

# Add the project root directory to sys.path for BAML client access
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
# Import the BAML client library
from baml_client.sync_client import b

# Create a new Flask application instance
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) for the app, allowing all origins
cors = CORS(app, origins="*")


def scrapeWebpage(link):
    try:
        response = requests.get(link)
        content = extract(response.content)
        return content if content else ""
    except Exception as e:
        print(f"Error scraping {link}: {e}")
        return ""


def scrapeWebpages(links):
    combined_text = ""
    for link in links:
        text = scrapeWebpage(link)
        combined_text += text + "\n"
    return combined_text


def extractAnalysis(content):
    try:
        response = b.AnalyzeProductReview(content)
        return {
            "name": response.name,
            "summary": response.summary,
            "price": response.price,
            "priceSource": response.priceSource,
            "specifications": response.specifications,
            "valueForMoney": response.valueForMoney,
            "soundQuality": response.soundQuality,
            "comfortFit": response.comfortFit,
            "batteryLife": response.batteryLife,
            "connectivity": response.connectivity,
            "featuresControls": response.featuresControls,
            "callQuality": response.callQuality,
            "brandWarranty": response.brandWarranty,
            "userFeedback": response.userFeedback,
            "availability": response.availability,
            "sentimentRating": response.sentimentRating,
            "sentiment": response.sentiment,
        }
    except Exception as e:
        return {"error": "Failed to extract analysis", "message": str(e)}


@app.route("/sentimentanalyzer", methods=["GET"])
def analyzer():
    # Get the product name from the query string
    productName = request.args.get("name", "")
    try:
        # Retrieve all documents from the "productReviews" collection
        docs = db.collection("productReviews").stream()
        for doc in docs:
            review = doc.to_dict()
            name = review.get("name", "")
            # Compare names in a case-insensitive way
            if name.lower() == productName.lower():
                links = review.get("links", [])
                image = review.get("image")
                amazonLink = review.get("amazonLink")

                # Scrape all webpages from the links array
                combinedText = scrapeWebpages(links)
                # Run the sentiment analysis on the combined text
                analysisContent = extractAnalysis(combinedText)
                return jsonify(
                    {
                        "name": name,
                        "links": links,
                        "image": image,
                        "amazonLink": amazonLink,
                        "analysisContent": analysisContent,
                    }
                )
        # If no review matches the productName
        return jsonify({"error": "Review not found"}), 404
    except Exception as e:
        return jsonify({"error": "Failed to analyze review", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=8081)
