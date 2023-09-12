#!/bin/bash

# Navigate to the project directory (change this path accordingly)
cd "$(dirname "$0")"/..

# Step 1: Build the Docker image
docker build -t gcr.io/psy-lines/psy-lines-backend .

# Step 2: Authenticate Docker to GCR
gcloud auth configure-docker

# Step 3: Push the Docker image to GCR
docker push gcr.io/psy-lines/psy-lines-backend

# Step 4: Set the active project
gcloud config set project psy-lines

# Step 5: Enable necessary APIs (add more APIs if needed)
gcloud services enable run.googleapis.com

# Step 6: Deploy the container image to Cloud Run
gcloud run deploy psy-lines-service --image gcr.io/psy-lines/psy-lines-backend --platform managed

echo "Deployment completed."
