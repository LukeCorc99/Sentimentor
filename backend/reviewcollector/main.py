from flask import Flask, jsonify
from flask_cors import CORS
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os
import urllib.parse

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
    with open(
        "../../frontend/public/headphonereviews.json", "r", encoding="utf-8"
    ) as file:
        return json.load(file)


def filterRepeatedProductReviews(reviews):
    # Dictionary to keep track of the count of each product name
    productCounts = {}

    # Dictionary to store product details (name and a list of links)
    productReviews = {}

    # Iterate through the list of reviews to count occurrences of each product by 'name'
    for review in reviews:
        productName = review["name"]
        productLink = review["link"]
        productImage = review["image"]

        # If the product name is encountered for the first time, initialize its count and details
        if productName not in productCounts:
            productCounts[productName] = 0  # Initialize count to 0
            productReviews[productName] = {
                "name": productName,
                "links": [],
                "image": productImage,
            }

        # Increment the count for the product
        productCounts[productName] += 1

        # Append the review link to the corresponding product in productReviews
        productReviews[productName]["links"].append(productLink)

        # If the product has an image, keep the first valid image encountered
        if productReviews[productName]["image"] is None and productImage:
            productReviews[productName]["image"] = productImage

    # Filter out products that appear less than twice
    repeatedReviews = [
        productReviews[name] for name, count in productCounts.items() if count >= 2
    ]

    # Return the filtered list containing only products that appear at least twice
    return repeatedReviews


def getAmazonLink(name):
    amazonLink = "https://www.amazon.com/s?k="
    amazonProduct = urllib.parse.quote(name)
    return f"{amazonLink}{amazonProduct}"


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

    uploadCount = 0

    # Delete all documents in the collection to avoid duplicates
    docs = collRef.stream()
    for doc in docs:
        doc.reference.delete()

    # Upload the filtered product reviews to Firestore
    for item in repeatedReviews:
        item["amazonLink"] = getAmazonLink(item["name"])
        collRef.add(item)
        uploadCount += 1

    print(f"Uploaded {uploadCount} documents to Firestore")

    app.run(debug=True, port=8080)
