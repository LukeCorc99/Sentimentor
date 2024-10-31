from flask import Flask, jsonify
import requests

app = Flask(__name__)

# URL of the random number generator microservice
random_microservice_url = "http://127.0.0.1:8001/generate"

# Function to call the random number generator microservice
def call_random_microservice():
    response = requests.get(random_microservice_url)
    # Extract the random number from the JSON response
    return response.json().get("random_number")

# Route to check if the random number is even or odd
@app.route("/check", methods=['GET'])
def check_even_odd():
    random_number = call_random_microservice()
    # Determine if the number is even or odd
    result = "even" if random_number % 2 == 0 else "odd"
    # Return the result as a JSON response
    return jsonify({"random_number": random_number, "result": result})

if __name__ == "__main__":
    # Run the Flask app on port 8002
    app.run(port=8002)
