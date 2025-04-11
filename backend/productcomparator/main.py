from baml_client.sync_client import b
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


def productToReviewText(product):
    lines = []
    lines.append(f"Name: {product.get('name', '')}")
    lines.append(f"Price: {product.get('price', '')}")
    lines.append(f"Rating: {product.get('rating', '')}")

    categories = product.get("categories", {})
    for cat, val in categories.items():
        lines.append(f"{cat}: {val}")

    return "\n".join(lines)


def extractComparison(analysisOne, analysisTwo):
    try:
        textOne = productToReviewText(analysisOne)
        textTwo = productToReviewText(analysisTwo)

        response = b.CompareAnalysis(textOne, textTwo)

        return {
            "bestProductName": response.bestProduct,
            "bestProductReason": response.bestProductReason,
        }
    except Exception as e:
        return {"error": "Failed to extract comparison", "message": str(e)}


def multiProductComparison(analyses):
    try:
        snippet_list = [productToReviewText(prod) for prod in analyses]

        combined_text = "\n\n---\n\n".join(snippet_list)

        response = b.CompareAnalysis(combined_text)

        return {
            "bestProductName": response.bestProduct,
            "bestProductReason": response.bestProductReason,
        }
    except Exception as e:
        return {
            "error": "Failed to extract multi-product comparison",
            "message": str(e),
        }


@app.route("/compareproducts", methods=["POST"])
def compareProducts():
    try:
        productData = request.json
        analyses = productData.get("analyses")

        if not isinstance(analyses, list) or not (2 <= len(analyses) <= 4):
            return (
                jsonify({"error": "Please provide between 2 and 4 product analyses"}),
                400,
            )

        comparisonResult = multiProductComparison(analyses)

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


if __name__ == "__main__":
    app.run(debug=True, port=8082)

    #  port = int(os.environ.get("PORT", 5000))
    #  app.run(debug=False, host="0.0.0.0", port=port)
