from flask import Flask, jsonify, request
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os
import sys
import json


# Load environment variables from .env file
load_dotenv()

# Get Firebase credentials from environment variables and parse them
firebaseCredentials = os.getenv("FIREBASE_CREDENTIALS")
credDict = json.loads(firebaseCredentials)  # Convert string to dictionary

# Initialize Firebase with credentials
cred = credentials.Certificate(credDict)
firebase_admin.initialize_app(cred)

# Get Firestore database instance
db = firestore.client()

# Initialize Flask app
app = Flask(__name__)
# Enable CORS for all origins (for development purposes)
cors = CORS(app, origins="*")

# Add the current directory to the Python path. Allows python to find and import the BAML client
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from baml_client.sync_client import b


# Converts a product analysis into a formatted string with name, price, rating and categories. This is used for the BAML AI model to compare products.
def productToReviewText(product):
    lines = []
    lines.append(f"Name: {product.get('name', '')}")
    lines.append(f"Price: {product.get('price', '')}")
    lines.append(f"Rating: {product.get('rating', '')}")

    # Add each category and its value
    categories = product.get("categories", {})
    for category, value in categories.items():
        lines.append(f"{category}: {value}")

    return "\n".join(lines)


# Compares multiple products by converting each to text format, combining them with separators, and sending to the BAML model
def multiProductComparison(analyses):
    try:
        # Convert each product to review text format
        snippetList = [productToReviewText(prod) for prod in analyses]

        # Join all product texts with separators
        combinedText = "\n\n---\n\n".join(snippetList)
        response = b.CompareAnalysis(combinedText)

        return {
            "bestProductName": response.bestProduct,
            "bestProductReason": response.bestProductReason,
        }
    except Exception as e:
        return {
            "error": "Failed to extract multi-product comparison",
            "message": str(e),
        }


# API endpoint that accepts product analyses in JSON format and returns comparison results from the AI model
@app.route("/compareproducts", methods=["POST"])
def compareProducts():
    try:
        productData = request.json
        analyses = productData.get("analyses")

        # Perform multi-product comparison
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


# Saves a product to the user's collection in Firestore database and returns the generated document ID
@app.route("/saveproduct", methods=["POST"])
def saveProduct():
    try:
        productData = request.json
        userId = productData.get("userId")

        # Get references to user document and savedProducts subcollection
        userRef = db.collection("users").document(userId)
        savedProductsRef = userRef.collection("savedProducts")

        # Add product to user's savedProducts collection
        savedProduct = savedProductsRef.add(productData)
        savedId = savedProduct[
            1
        ].id  # Extract the document ID. This is used to delete a saved product if needed.

        return (
            jsonify(
                {
                    "message": "Product saved in savedProducts",
                    "docId": savedId,
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Removes a product from the user's saved collection using the provided product ID and user ID
@app.route("/deleteproduct", methods=["POST"])
def deleteProduct():
    try:
        productData = request.get_json()
        productID = productData["id"]
        userId = productData["userId"]

        # Get reference to the specific product document and delete it
        ref = db.collection("users").document(userId)
        savedRef = ref.collection("savedProducts").document(productID)
        savedRef.delete()

        return jsonify({"message": "Product deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Run the microservice
if __name__ == "__main__":
    # Development server configuration
    # app.run(debug=True, port=8082)

    # Production server configuration
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
