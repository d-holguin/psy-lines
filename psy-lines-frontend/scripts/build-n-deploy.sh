#!/bin/bash

cd "$(dirname "$0")"/..

# Step 1: Build the Angular project (if not already built)
ng build --configuration production

# Step 2: Build the Docker image
docker build --no-cache -t gcr.io/psy-lines/psy-lines-frontend .

# Step 3: Authenticate Docker to GCR
gcloud auth configure-docker

# Step 4: Push the Docker image to GCR
docker push gcr.io/psy-lines/psy-lines-frontend

# Step 5: Set the active project
gcloud config set project psy-lines

# Step 6: Enable necessary APIs (add more APIs if needed)
gcloud services enable run.googleapis.com

# Step 7: Deploy the container image to Cloud Run
gcloud run deploy psy-lines-frontend-service --image gcr.io/psy-lines/psy-lines-frontend --platform managed --allow-unauthenticated


echo "Deployment completed."
