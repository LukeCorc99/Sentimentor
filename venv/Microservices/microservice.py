from flask import Flask, jsonify  # Import Flask and jsonify from the flask package

app = Flask(__name__)  # Create an instance of the Flask class

@app.route("/hello", methods=['GET'])  # Define a route for the URL /hello that accepts GET requests
def hello_microservice():
    # Define a dictionary with a message
    message = {"message": "Hello from the microservice! This is GeeksForGeeks"}
    return jsonify(message)  # Return the message as a JSON response

if __name__ == "__main__":
    app.run(port=8000)  # Run the Flask application on port 8000
