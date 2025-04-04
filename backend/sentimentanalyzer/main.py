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


@app.route("/sentimentanalyzer", methods=["GET"])
def analyzer():
    productName = request.args.get("name", "")
    try:
        docs = db.collection("productReviews").stream()
        for doc in docs:
            review = doc.to_dict()
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
        return jsonify({"error": "Review not found"}), 404
    except Exception as e:
        return jsonify({"error": "Failed to analyze review", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=8081)
    # port = int(os.environ.get("PORT", 5000))
    # app.run(debug=False, host="0.0.0.0", port=port)
