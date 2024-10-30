from flask import Flask, jsonify
import random

# Initialize the Flask application
app = Flask(__name__)

# Define a route for generating a random number
@app.route("/generate", methods=['GET'])
def generate_random_number():
    # Generate a random number between 1 and 1000
    random_number = random.randint(1, 1000)
    # Return the random number as a JSON response
    return jsonify({"random_number": random_number})

# Run the application on port 8001
if __name__ == "__main__":
    app.run(port=8001)
