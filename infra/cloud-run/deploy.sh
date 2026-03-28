#!/bin/bash
# ============================================================
#  Deploy to GCP Cloud Run
#  Usage: ./deploy.sh <PROJECT_ID>
# ============================================================

set -euo pipefail

PROJECT_ID="${1:?Usage: ./deploy.sh <PROJECT_ID>}"
REGION="europe-west1"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "🚀 Deploying Connected Weather Station to GCP ($PROJECT_ID)"
echo "   Region: $REGION"
echo ""

# ---- 1. Enable required APIs ----
echo "📦 Enabling APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com \
  --project="$PROJECT_ID" --quiet

# ---- 2. Build & deploy backend ----
echo ""
echo "🔧 Building backend..."
cd "$REPO_ROOT/backend"
gcloud builds submit --tag "gcr.io/$PROJECT_ID/weather-station-api" \
  --project="$PROJECT_ID" --quiet

echo "🚀 Deploying backend to Cloud Run..."
gcloud run deploy weather-station-api \
  --image "gcr.io/$PROJECT_ID/weather-station-api" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --platform managed \
  --allow-unauthenticated \
  --port 8000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --quiet

BACKEND_URL=$(gcloud run services describe weather-station-api \
  --region "$REGION" --project "$PROJECT_ID" \
  --format="value(status.url)")

echo "✅ Backend deployed: $BACKEND_URL"

# ---- 3. Build & deploy frontend ----
echo ""
echo "🔧 Building frontend..."
cd "$REPO_ROOT/frontend"

# Inject backend URL at build time
echo "VITE_API_URL=$BACKEND_URL" > .env.production

gcloud builds submit --tag "gcr.io/$PROJECT_ID/weather-station-dashboard" \
  --project="$PROJECT_ID" --quiet

echo "🚀 Deploying frontend to Cloud Run..."
gcloud run deploy weather-station-dashboard \
  --image "gcr.io/$PROJECT_ID/weather-station-dashboard" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --platform managed \
  --allow-unauthenticated \
  --port 80 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 2 \
  --quiet

FRONTEND_URL=$(gcloud run services describe weather-station-dashboard \
  --region "$REGION" --project "$PROJECT_ID" \
  --format="value(status.url)")

echo ""
echo "============================================"
echo "✅ Deployment Complete!"
echo "   Dashboard:  $FRONTEND_URL"
echo "   API:        $BACKEND_URL"
echo "   API Docs:   $BACKEND_URL/docs"
echo "============================================"
echo ""
echo "⚠️  Next steps:"
echo "   1. Create Cloud SQL instance for PostgreSQL"
echo "   2. Set DATABASE_URL and JWT_SECRET_KEY secrets"
echo "   3. Update CORS_ORIGINS on the backend"
