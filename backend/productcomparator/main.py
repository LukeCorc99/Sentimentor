from flask import Flask, jsonify, request
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os
import sys
import json

load_dotenv()

firebaseCredentials = os.getenv("FIREBASE_CREDENTIALS")
credDict = json.loads(firebaseCredentials)

cred = credentials.Certificate(credDict)
firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)
cors = CORS(app, origins="*")

# Add the project root directory to sys.path for BAML client access
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
# Import the BAML client library
from baml_client.sync_client import b


def extractComparison(analysisOne, analysisTwo):
    try:
        analysisOneContent = json.dumps(analysisOne["analysisContent"])
        analysisTwoContent = json.dumps(analysisTwo["analysisContent"])

        response = b.CompareAnalysis(analysisOneContent, analysisTwoContent)

        return {
            "name1": response.name1,
            "name2": response.name2,
            "summary": response.summary,
            "price1": response.price1,
            "price2": response.price2,
            "priceSource1": response.priceSource1,
            "priceSource2": response.priceSource2,
            "specifications1": response.specifications1,
            "specifications2": response.specifications2,
            "score1": response.score1,
            "score2": response.score2,
            "sentiment1": response.sentiment1,
            "sentiment2": response.sentiment2,
            "valueForMoneyComparison": response.valueForMoneyComparison,
            "soundQualityComparison": response.soundQualityComparison,
            "comfortFitComparison": response.comfortFitComparison,
            "batteryLifeComparison": response.batteryLifeComparison,
            "connectivityComparison": response.connectivityComparison,
            "featuresControlsComparison": response.featuresControlsComparison,
            "callQualityComparison": response.callQualityComparison,
            "brandWarrantyComparison": response.brandWarrantyComparison,
            "userFeedbackComparison": response.userFeedbackComparison,
            "availabilityComparison": response.availabilityComparison,
            "overallSentimentComparison": response.overallSentimentComparison,
            "recommendation": response.recommendation,
        }
    except Exception as e:
        return {"error": "Failed to extract analysis", "message": str(e)}


@app.route("/saveproduct", methods=["POST"])
def saveProduct():
    try:
        # Get product data from request
        productData = request.json

        # Save product to Firestore
        db.collection("savedproducts").add(productData)
        return jsonify({"message": "Product saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/deleteproduct", methods=["POST"])
def deleteProduct():
    try:
        productData = request.get_json()
        productID = productData["id"]

        # Delete the document from Firestore
        doc = db.collection("savedproducts").document(productID)
        doc.delete()

        return jsonify({"message": "Product deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/compareproducts", methods=["POST"])
def compareProducts():
    try:
        # Get product data from request
        productData = request.json

        # Extract the two analyses from productData
        analysisOne = productData.get("analysisOne")
        analysisTwo = productData.get("analysisTwo")

        # Call extractComparison and get the result
        comparisonResult = extractComparison(analysisOne, analysisTwo)

        # Return the comparison result
        return (
            jsonify(
                {
                    "comparison": comparisonResult,
                    "message": "Analyses compared successfully",
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=8082)
