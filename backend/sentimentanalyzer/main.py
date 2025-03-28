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

load_dotenv()

firebaseCredentials = os.getenv("FIREBASE_CREDENTIALS")
credDict = json.loads(firebaseCredentials)

cred = credentials.Certificate(credDict)
firebase_admin.initialize_app(cred)

db = firestore.client()

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from baml_client.sync_client import b

app = Flask(__name__)
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
    # app.run(debug=True, port=8081)
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
