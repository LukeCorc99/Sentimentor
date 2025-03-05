from flask import Flask, jsonify
from flask_cors import CORS
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os
import urllib.parse
import re


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


def extractImageResolution(imageUrl):
    if not imageUrl:
        return 0
    match = re.search(r"(\d{2,4})[xX](\d{2,4})", imageUrl)
    if match:
        width, height = map(int, match.groups())
        return width * height
    return 0


def extractName(name):
    words = name.lower().split()
    keywords = [
        word
        for word in words
        if word
        not in {"the", "with", "and", "a", "for", "in", "on", "at", "by", "of", "to"}
    ]
    return " ".join(keywords[:3])


def filterRepeatedProductReviews(reviews):
    productGroups = {}

    for review in reviews:
        productName = review["name"]
        productLink = review["link"]
        productImage = review.get("image", "")
        coreName = extractName(productName)

        if coreName not in productGroups:
            productGroups[coreName] = {
                "name": [productName],
                "shortestName": productName,
                "links": [],
                "image": productImage if productImage else "",
                "highestQualityImage": productImage if productImage else "",
                "maxResolution": extractImageResolution(productImage),
            }
        else:
            productGroups[coreName]["name"].append(productName)

            if len(productName) < len(productGroups[coreName]["shortestName"]):
                productGroups[coreName]["shortestName"] = productName

            currentResolution = extractImageResolution(productImage)
            if (
                productImage
                and currentResolution > productGroups[coreName]["maxResolution"]
            ):
                productGroups[coreName]["highestQualityImage"] = productImage
                productGroups[coreName]["maxResolution"] = currentResolution

        productGroups[coreName]["links"].append(productLink)

    return [
        {
            "name": details["shortestName"],
            "links": details["links"],
            "image": (
                details["highestQualityImage"]
                if details["highestQualityImage"]
                else None
            ),
        }
        for details in productGroups.values()
        if len(details["name"]) >= 2
    ]


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
