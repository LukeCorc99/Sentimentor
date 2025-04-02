#!/bin/bash

echo "Starting all Heroku apps"

cd backend/productcomparator
heroku ps:scale web=1 -a sentimentor-productcomparator

cd ../sentimentanalyzer
heroku ps:scale web=1 -a sentimentor-sentimentanalyzer

cd ../../frontend
heroku ps:scale web=1 -a sentimentor

echo "All apps scaled up"
