#!/bin/bash

# Google Cloud Run Deployment Script for UniTrack MCP Server

set -e

echo "🚀 Deploying UniTrack MCP Server to Google Cloud Run..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "🔐 Please authenticate with Google Cloud:"
    gcloud auth login
fi

# Get the current project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project ID set. Please set a project:"
    echo "gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Project ID: $PROJECT_ID"

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and deploy using Cloud Build
echo "🏗️ Building and deploying with Cloud Build..."
gcloud builds submit --config cloudbuild.yaml .

# Get the service URL
SERVICE_URL=$(gcloud run services describe unitrack-mcp-server --region=us-central1 --format="value(status.url)")

echo "✅ Deployment complete!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "📋 Test your deployment:"
echo "Health check: $SERVICE_URL/health"
echo "Web interface: $SERVICE_URL/"
echo "API docs: $SERVICE_URL/"
echo ""
echo "🧪 Test tracking:"
echo "curl -X POST $SERVICE_URL/api/track \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"tracking_number\": \"PRVP0000230127\"}'" 