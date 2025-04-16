# Sentimentor 

<div align="center">
  <img src="screenshots/welcomemessage.png" alt="Welcome" width="100%" />
</div>

[**Access Sentimentor here!**](https://sentimentor-b99323d2c946.herokuapp.com)
(Some details may not load if you are using Safari. Chrome/Edge is recommended.)

## Overview 
Have you ever grown tired of the daunting process of product research?
Introducing **Sentimentor** - a microservice-based project built with Python and React.js that revolutionizes the way users can conduct product research.
Sentimentor harnesses natural language processing (NLP) techniques to analyze reviews from multiple sources, delivering detailed sentiment analysis and comprehensive product breakdowns. This empowers the user to make faster and more informed decisions.
With its highly intuitive and easy-to-use interface, Sentimentor fast-tracks the entire research process - from scraping review pages and extracting key insights, to comparing products side-by-side, so that you have all the information you need to choose the best option for you.
  

## Table of Contents 

- [Usage](#usage) 

- [Installation](#local-installation) 

- [Features](#features) 

- [Contributors](#contributors) 


## Usage 
Simply access the application through the website: [https://sentimentor-b99323d2c946.herokuapp.com](https://sentimentor-b99323d2c946.herokuapp.com).

## Local Installation 
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
9. **Start up backend microservices:**  
   From the project's base directory, navigate to each microservice and run them.
   ```
   cd backend/sentimentanalyzer
   python main.py
   ```
   ```
   cd backend/productcomparator
   python main.py
   ```
   ```
   cd backend/reviewcollector
   python main.py
   ```
10. **Run the application locally:**

   Navigate back to the project root directory and run the application on a local host.
   ```
   cd frontend 
   npm run dev
   ```


## Features 
**1. User Registration and Login**
Allow users to create accounts and sign in. Each account is provided with their own database, which the user can use to save product analyses of the products that they are interested in.

**2. Product Search**
Search for a product and initiate an in-depth analysis by aggregating reviews from multiple sources.

**3. Product Analysis**
Receive a detailed breakdown of the product, including a summary, pricing information, an option to search for the product on Amazon, and a sentiment rating along with a breakdown under various categories.

**4. Product Comparison**
Save and compare up to four products side-by-side based on sentiment ratings, price, and various criteria such as value for money, comfort, etc., making it easier to determine the best option for your needs.


## Contributors 
Created by Luke Corcoran [@LukeCorc99](https://github.com/LukeCorc99) 

 
