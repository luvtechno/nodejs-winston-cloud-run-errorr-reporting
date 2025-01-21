#!/bin/bash

# スクリプトが失敗した場合即座に終了
set -e

echo "🚀 Deploying to Cloud Run..."

# Cloud Runへのデプロイ
gcloud run deploy nodejs-winston-cloud-run-errorr-reporting \
  --source . \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated

echo "✨ Deployment completed successfully!"
