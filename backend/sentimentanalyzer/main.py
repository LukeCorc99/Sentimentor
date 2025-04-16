# Flask modules
from flask import Flask, jsonify, request
from flask_cors import CORS

# HTTP request handling and content extraction
import requests
from trafilatura import extract

# Environment variable loading
from dotenv import load_dotenv
import os
import sys
import json

# Import firebase Admin for Firestore access
import firebase_admin
from firebase_admin import credentials, firestore


# Load environment variables from .env file
load_dotenv()

# Retrieve and parse Firebase credentials from environment variable
firebaseCredentials = os.getenv("FIREBASE_CREDENTIALS")
credDict = json.loads(firebaseCredentials)

# Initialize Firebase app with the credentials and create Firestore client
cred = credentials.Certificate(credDict)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Add current directory to system path (used to import BAML client) and import BAML
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from baml_client.sync_client import b

# Initialize Flask app + enable CORS
app = Flask(__name__)
cors = CORS(app, origins="*")


# Scrapes and extracts only relevant text from a webpage URL, does not return HTML or other content
def scrapeWebpage(link):
    try:
        response = requests.get(link)
        content = extract(response.content)
        return content
    except Exception as e:
        print(f"Error scraping {link}: {e}")
        return ""


# Scrapes multiple webpages and combines it all into a single string
def scrapeWebpages(links):
    combinedText = ""
    for link in links:
        text = scrapeWebpage(link)
        combinedText += text + "\n"
    return combinedText


# Uses BAML client to extract structured analysis from the combined review text
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
            "valueForMoneyRating": response.valueForMoneyRating,
            "soundQuality": response.soundQuality,
            "soundQualityRating": response.soundQualityRating,
            "comfortFit": response.comfortFit,
            "comfortFitRating": response.comfortFitRating,
            "batteryLife": response.batteryLife,
            "batteryLifeRating": response.batteryLifeRating,
            "connectivity": response.connectivity,
            "connectivityRating": response.connectivityRating,
            "featuresControls": response.featuresControls,
            "featuresControlsRating": response.featuresControlsRating,
            "callQuality": response.callQuality,
            "callQualityRating": response.callQualityRating,
            "brandWarranty": response.brandWarranty,
            "brandWarrantyRating": response.brandWarrantyRating,
            "userFeedback": response.userFeedback,
            "userFeedbackRating": response.userFeedbackRating,
            "availability": response.availability,
            "availabilityRating": response.availabilityRating,
            "sentimentRating": response.sentimentRating,
            "sentiment": response.sentiment,
        }
    except Exception as e:
        return {"error": "Failed to extract analysis", "message": str(e)}


# Flask route to analyze a product's reviews based on its name
@app.route("/sentimentanalyzer", methods=["GET"])
def analyzer():
    # Get product name from request arguments, default to empty string if not provided
    productName = request.args.get("name", "")
    try:
        # Query Firestore for documents in "productReviews" collection
        docs = db.collection("productReviews").stream()
        for doc in docs:
            review = doc.to_dict()  # Convert document to dictionary
            name = review.get("name", "")

            if name.lower() == productName.lower():
                links = review.get("links", [])
                image = review.get("image")
                amazonLink = review.get("amazonLink")

                combinedText = scrapeWebpages(links)
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
    except Exception as e:
        return jsonify({"error": "Failed to analyze review", "message": str(e)}), 500


# Run the microservice
if __name__ == "__main__":
    # Development server configuration
    # app.run(debug=True, port=8081)

    # Production server configuration
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
