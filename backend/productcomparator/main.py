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

# Add the project root directory to sys.path for BAML client access
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
# Import the BAML client library
from baml_client.sync_client import b


@app.route("/saveproduct", methods=["POST"])
def saveProduct():
    try:
        # Get product data from request
        product_data = request.json
        if not product_data:
            return jsonify({"error": "No data to save"}), 400
        
        # Save product to Firestore
        db.collection("savedproducts").add(product_data)
        return jsonify({"message": "Product saved successfully"}), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/deleteproduct", methods=["POST"])
def deleteProduct():
    try:
        product_data = request.get_json()

        # Check if the product has an 'id' field (or whatever your unique identifier is)
        if "id" not in product_data:
            return jsonify({"error": "Product ID is required"}), 400  # Bad Request

        product_id = product_data["id"]

        # Delete the document from Firestore
        doc_ref = db.collection("savedproducts").document(product_id)
        doc_ref.delete()

        return jsonify({"message": "Product deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8082)