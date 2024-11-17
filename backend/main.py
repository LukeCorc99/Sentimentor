# Import Flask and jsonify from the flask package
from flask import Flask, jsonify

# Import CORS from the flask_cors package
from flask_cors import CORS

# Create a new Flask application instance
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) for the app, allowing all origins
cors = CORS(app, origins='*')

# Define a route for the /api/users endpoint, accepting GET requests
@app.route("/api/users", methods=["GET"])
def users():
    # Return a JSON response with a list of users
    return jsonify({"users": ["Alice", "Bob", "Charlie"]})

# Check if the script is being run directly (not imported as a module)
if __name__ == "__main__":
    # Run the Flask app in debug mode on port 8080
    app.run(debug=True, port=8080)