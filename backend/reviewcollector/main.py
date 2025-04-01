from flask import Flask, jsonify
from flask_cors import CORS
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os
import urllib.parse
import re
import sys
from rapidfuzz import fuzz, process


load_dotenv()
firebaseCredentials = os.getenv("FIREBASE_CREDENTIALS")
credDict = json.loads(firebaseCredentials)

cred = credentials.Certificate(credDict)
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
CORS(app, origins="*")

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from baml_client.sync_client import b


def extractProductName(titles):
    try:
        response = b.ExtractProductName(titles)
        return {"names": response.productNames}
    except Exception as e:
        return {"error": "Failed to extract name", "message": str(e)}


def extractProductReviewLinks(name, links):
    try:
        response = b.ExtractProductReviewLinks(name, links)
        return {"links": response.productReviewURLs}
    except Exception as e:
        return {"error": "Failed to extract links", "message": str(e)}


def loadHeadphoneReviews():
    with open(
        "../../frontend/public/headphonereviews.json", "r", encoding="utf-8"
    ) as file:
        return json.load(file)


def getImageForLink(review_link):
    reviews = loadHeadphoneReviews()
    for review in reviews:
        if review.get("link") == review_link:
            return review.get("image", None)
    return None


def groupReviews(reviews, threshold=52):
    groups = []
    group_names = []

    for review in reviews:
        title = review["name"]
        link = review["link"]

        match = process.extractOne(
            title, group_names, scorer=fuzz.token_set_ratio, score_cutoff=threshold
        )

        if match:
            match_name = match[0]
            for group in groups:
                if group["group_name"] == match_name:
                    group["titles"].append(title)
                    group["links"].append(link)
                    break
        else:
            groups.append({"group_name": title, "titles": [title], "links": [link]})
            group_names.append(title)

    return [
        {"names": group["titles"], "links": group["links"]}
        for group in groups
        if len(group["titles"]) >= 2
    ]


def getAmazonLink(name):
    return f"https://www.amazon.com/s?k={urllib.parse.quote(name)}"


@app.route("/productreviews", methods=["GET"])
def getProductReviews():
    try:
        reviews = loadHeadphoneReviews()
        repeated = groupReviews(reviews)
        return jsonify(repeated), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    headphoneReviews = loadHeadphoneReviews()
    repeatedReviews = groupReviews(headphoneReviews)

    collection = "productReviews"
    collRef = db.collection(collection)

    # for doc in collRef.stream():
    # doc.reference.delete()

    uploadCount = 0

    for item in repeatedReviews:
        print(f"\nExtracting product name from titles: {item['names']}")
        extractedNames = extractProductName(item["names"])
        productNames = extractedNames.get("names", [])
        print(f"Extracted names: {productNames}")

        if not productNames:
            print(f"name extraction failed: {item['names']}")
            continue

        print(f"Filtering links:")
        for link in item["links"]:
            print(f"   - {link}")

        for name in productNames:
            singleResult = extractProductReviewLinks(name, item["links"])
            links = singleResult.get("links", [])

            print(f"\nBAML returned {len(links)} filtered review links for '{name}':")
            for link in links:
                print(f"- link: {link}")

            if len(links) < 2:
                print(f"Skipped '{name}' (less than 2 valid review links)")
                continue

            image = None
            for link in links:
                print(f"🔍 Checking image for link: {link}")
                image = getImageForLink(link)
                if image:
                    print(f"Found image: {image}")
                    break

            doc = {
                "name": name,
                "links": links,
                "amazonLink": getAmazonLink(name),
                "image": image,
            }

            # collRef.add(doc)
            uploadCount += 1
            print(f"Uploaded '{name}' with {len(links)} reviews.")

    print(f"\nUploaded {uploadCount} product(s) to Firestore.")

    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
    # app.run(debug=True, port=8080)
