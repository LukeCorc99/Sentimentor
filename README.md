# Sentimentor 
## Overview 
A Python and React.js microservice-based project designed to simplify product research by analyzing reviews from multiple sources. Using Natural Language Processing (NLP), it evaluates sentiment and provides an aggregated score, enabling users to make faster, informed decisions. It uses various frameworks to scrape multiple review web pages, analyze the content of these sources and compare the analysis.
  

## Table of Contents 

- [Installation](#installation) 

- [Usage](#usage) 

- [Features](#features) 

- [Contributors](#contributors) 

  

## Installation 
1. **Install Visual Studio Code**
   Make sure that Visual Studio Code is installed on your machine.
   - Go to the Visual Studio Code download page.
   - Download the Windows installer (.exe).
   - Run the installer and follow the prompts to complete the installation.
   Once installed, you can launch Visual Studio Code either normally or by typing `code .` in your terminal (after ensuring it is added to your PATH).

2. **Clone the repository:**
   Open your Command Line Interface and clone the project to your machine:
   ```
   git clone https://github.com/LukeCorc99/Sentimentor.git
   ```
3. **Navigate to the project directory:**
   ```
   cd path/to/the/project
   ```
4. **Open Visual Studio Code via Project Directory**
   ```
   code .
   ```
5. **Install Python:**
   -  Click on the Extensions icon in the Activity Bar on the left-hand side.
   -  Search for "Python" in the Extensions view and install the Python extension published by Microsoft.
  
6. **Install Node.js:**
   Download and install Node.js https://nodejs.org/en from the official website. Run the following commands in your CLI.
   ```
   node -v
   npm -v
   ```
7. **Install frontend dependencies:**
   Run the following command to install necessary Vite and React.js dependencies:
   ```
   npm install
   ```
8. **Install backend dependencies:**
   Run the following command to install the necessary dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage 
1. **Activate the Backend Environment:**
   Navigate to the backend folder and activate the virtual environment:
   ```
   cd backend
   source venv\Scripts\activate
   ```
2. **Initialize Sentiment Analyzer Microservice:**
   Navigate to the sentiment analyzer service and run it:
   ```
   cd backend/sentimentanalyzer
   python main.py
   ```
3. **Start the Frontend Development Server:**
Open a new terminal, navigate to the frontend folder, and run the Vite server:
   ```
   cd frontend
   npm run dev
   ```
3. **Access the Application:**
Open your browser and visit the link provided by Vite (e.g., http://localhost:5173) to interact with the application.


## Features 
**1. User Registration and Login**
Allow users to create accounts and sign in.

**2. Product Search**
Search for products to view detailed information and analyze sentiment around a specified product.

**3. Sentiment Analysis**
Analyze reviews across multiple sources and provide sentiment scores.

**4. Product Comparison**
Save and compare multiple products based on sentiment scores and other attributes.

**5. Filter and Sort Options**
Filter and sort products based on criteria like sentiment score and review count.

**6. Settings Page**
Adjust application preferences to suit user needs.

**7. Help Page**
Provide guidance on using the application's features.


## Contributors 
Created by Luke Corcoran [@LukeCorc99](https://github.com/LukeCorc99) 

 
