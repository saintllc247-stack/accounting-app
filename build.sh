#!/usr/bin/env bash
set -e

echo "=== Building frontend ==="
cd frontend
npm ci
npm run build
cd ..

echo "=== Copying to backend/static ==="
rm -rf backend/static
cp -r frontend/dist backend/static

echo "=== Installing backend deps ==="
cd backend
pip install -r requirements.txt

echo "=== Done ==="
echo "Run: cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000"
