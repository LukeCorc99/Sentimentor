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


# Load camera reviews from the JSON file
def loadCameraReviews():
    with open("../../frontend/public/camerareviews.json", "r") as file:
        return json.load(file)


# Define a route for the /api/cameras endpoint, accepting GET requests
@app.route("/cameras", methods=["GET"])
def cameras():
    # Return the JSON content of the camera reviews file
    try:
        reviews = loadCameraReviews()
        return jsonify(reviews)
    except Exception as e:
        return (
            jsonify({"error": "Failed to load camera reviews", "message": str(e)}),
            500,
        )


def loadTelevisionReviews():
    with open("../../frontend/public/televisionreviews.json", "r") as file:
        return json.load(file)


# Function to upload reviews to Firestore
def uploadReviews(collection, reviews):
    try:
        for review in reviews:
            # Add each review as a new document in the Firestore collection
            db.collection(collection).add(review)
        print(
            f"Uploaded {len(reviews)} reviews to Firestore collection '{collection}'."
        )
    except Exception as e:
        print(f"Error uploading reviews to Firestore: {str(e)}")


# Define a route for the /api/televisions endpoint, accepting GET requests
@app.route("/televisions", methods=["GET"])
def televisions():
    # Return the JSON content of the television reviews file
    try:
        reviews = loadTelevisionReviews()
        return jsonify(reviews)
    except Exception as e:
        return (
            jsonify({"error": "Failed to load television reviews", "message": str(e)}),
            500,
        )


# Check if the script is being run directly (not imported as a module)
if __name__ == "__main__":
    # Load reviews from the JSON file
    cameraReviews = loadCameraReviews()

    # Specify the Firestore collection name (e.g., "camerareviews")
    collectionName = "camerareviews"

    # Upload reviews to Firestore
    uploadReviews(collectionName, cameraReviews)

    # Run the Flask app
    app.run(debug=True, port=8080)
