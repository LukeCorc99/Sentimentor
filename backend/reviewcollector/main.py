from flask import Flask, jsonify
from flask_cors import CORS
import json

# Create a new Flask application instance
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) for the app, allowing all origins
cors = CORS(app, origins="*")


# Load camera reviews from the JSON file
def load_camera_reviews():
    with open(
        "reviewcollector/spiders/camerareviews.json", "r"
    ) as file:
        return json.load(file)


# Define a route for the /api/cameras endpoint, accepting GET requests
@app.route("/api/cameras", methods=["GET"])
def cameras():
    # Return the JSON content of the camera reviews file
    try:
        reviews = load_camera_reviews()
        return jsonify(reviews)
    except Exception as e:
        return (
            jsonify({"error": "Failed to load camera reviews", "message": str(e)}),
            500,
        )


# Check if the script is being run directly (not imported as a module)
if __name__ == "__main__":
    # Run the Flask app in debug mode on port 8080
    app.run(debug=True, port=8080)
