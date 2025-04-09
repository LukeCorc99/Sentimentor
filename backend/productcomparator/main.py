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

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
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
        productData = request.json
        userId = productData.get("userId")
        if not userId:
            return jsonify({"error": "Missing userId"}), 400

        userRef = db.collection("users").document(userId)
        savedProductsRef = userRef.collection("savedProducts")

        new_doc = savedProductsRef.add(productData)
        doc_id = new_doc[1].id

        return (
            jsonify(
                {
                    "message": "Product saved in /users/{uid}/savedProducts",
                    "docId": doc_id,
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/deleteproduct", methods=["POST"])
def deleteProduct():
    try:
        productData = request.get_json()
        productID = productData["id"]
        userId = productData["userId"]

        user_ref = db.collection("users").document(userId)
        saved_ref = user_ref.collection("savedProducts").document(productID)
        saved_ref.delete()

        return jsonify({"message": "Product deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/compareproducts", methods=["POST"])
def compareProducts():
    try:
        productData = request.json

        analysisOne = productData.get("analysisOne")
        analysisTwo = productData.get("analysisTwo")

        comparisonResult = extractComparison(analysisOne, analysisTwo)

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
    #  port = int(os.environ.get("PORT", 5000))
    #  app.run(debug=False, host="0.0.0.0", port=port)
