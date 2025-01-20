from flask import Flask, jsonify, request
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os
import json


load_dotenv()

firebaseCredentials = os.getenv("FIREBASE_CREDENTIALS")
credDict = json.loads(firebaseCredentials)

cred = credentials.Certificate(credDict)
firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)
cors = CORS(app, origins="*")

@app.route("/save_product", methods=["POST"])
def save_product():
    try:
        # Get product data from request
        product_data = request.json
        if not product_data:
            return jsonify({"error": "No product data provided"}), 400
        
        # Save product to Firestore
        db.collection("savedproducts").add(product_data)
        return jsonify({"message": "Product saved successfully"}), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8082)