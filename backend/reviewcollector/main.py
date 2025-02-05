from flask import Flask, jsonify
from flask_cors import CORS
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os

# Load environment variables from .env. This helps to keep API key hidden.
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

# Create a new Flask application instance
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) for the app, allowing all origins
cors = CORS(app, origins="*")


def loadHeadphoneReviews():
    with open("../../frontend/public/headphonereviews.json", "r", encoding="utf-8") as file:
        return json.load(file)


def filterRepeatedProductReviews(reviews):
    productCounts = {}
    productReviews = {}

    # Count occurrences of each product by 'name'
    for review in reviews:
        productName = review["name"]
        if productName not in productCounts:
            productCounts[productName] = 0
            productReviews[productName] = {
                "name": productName,
                "links": []
            }
        productCounts[productName] += 1
        productReviews[productName]["links"].append(review["link"])

    # Filter only products appearing two or more times
    repeatedReviews = [
        productReviews[name]
        for name, count in productCounts.items()
        if count >= 2
    ]
    return repeatedReviews


@app.route("/productreviews", methods=["GET"])
def getProductReviews():
    try:
        reviews = loadHeadphoneReviews()
        repeated = filterRepeatedProductReviews(reviews)
        return jsonify(repeated), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    headphoneReviews = loadHeadphoneReviews()

    repeatedReviews = filterRepeatedProductReviews(headphoneReviews)

    collection = "productReviews"
    collRef = db.collection(collection)

    for item in repeatedReviews:
        collRef.add(item)

    print("Product reviews uploaded successfully.")

    app.run(debug=True, port=8080)
