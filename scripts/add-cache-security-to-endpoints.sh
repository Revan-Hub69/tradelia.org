#!/bin/bash

# Script per aggiungere cache e security headers a tutti gli endpoint
# Usage: ./scripts/add-cache-security-to-endpoints.sh

echo "Adding cache and security headers to all market-indicators endpoints..."

# Lista di endpoint da aggiornare
ENDPOINTS=(
  "app/api/market-indicators/stock-indexes/route.ts"
  "app/api/market-indicators/credit-spreads/route.ts"
  "app/api/market-indicators/put-call-ratio/route.ts"
  "app/api/market-indicators/vix-term-structure/route.ts"
  "app/api/market-indicators/market-breadth/route.ts"
  "app/api/market-indicators/mcclellan-oscillator/route.ts"
  "app/api/market-indicators/arms-index/route.ts"
  "app/api/market-indicators/momentum-composite/route.ts"
  "app/api/market-indicators/volatility-composite/route.ts"
  "app/api/market-indicators/sentiment-composite/route.ts"
)

echo "Total endpoints to update: ${#ENDPOINTS[@]}"
echo "Note: This script is a template. Manual review recommended for each endpoint."
