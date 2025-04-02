#!/bin/bash

echo "Stopping all Heroku apps"

cd ../productcomparator
heroku ps:scale web=0 -a sentimentor-productcomparator

cd ../sentimentanalyzer
heroku ps:scale web=0 -a sentimentor-sentimentanalyzer

cd ../../frontend
heroku ps:scale web=0 -a sentimentor

echo "All apps scaled down"
