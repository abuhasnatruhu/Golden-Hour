#!/bin/bash
echo "=== FINAL VERIFICATION TEST ==="
echo ""

# Test 1: Check for duplicate cards
echo "1. Checking for duplicate cards..."
COUNT=$(curl -s http://localhost:3002 | grep -o "Golden Hour" | wc -l)
if [ $COUNT -le 10 ]; then
  echo "✓ No excessive duplicates found (Golden Hour count: $COUNT)"
else
  echo "✗ Too many Golden Hour references: $COUNT"
fi

# Test 2: Check floating menu exists
echo ""
echo "2. Checking floating menu..."
if curl -s http://localhost:3002 | grep -q "FloatingNavigation"; then
  echo "✓ Floating navigation component present"
else
  echo "✗ Floating navigation not found"
fi

# Test 3: Test multiple locations for negative times
echo ""
echo "3. Testing time calculations for multiple cities..."
CITIES=(
  "40.7128,-74.006,New York"
  "48.8566,2.3522,Paris"
  "-33.8688,151.2093,Sydney"
  "35.6762,139.6503,Tokyo"
  "51.5074,-0.1278,London"
)

NEGATIVE_FOUND=0
for CITY in "${CITIES[@]}"; do
  IFS=',' read -r LAT LON NAME <<< "$CITY"
  RESPONSE=$(curl -s "http://localhost:3002/api/golden-hour?lat=$LAT&lon=$LON&date=2025-09-01")
  if echo "$RESPONSE" | grep -q '"duration": *-'; then
    echo "✗ Negative duration found for $NAME"
    NEGATIVE_FOUND=1
  else
    echo "✓ $NAME: No negative times"
  fi
done

if [ $NEGATIVE_FOUND -eq 0 ]; then
  echo "✓ All cities have valid time calculations"
fi

# Test 4: Check Next Golden Hour card presence
echo ""
echo "4. Checking Next Golden Hour card..."
if curl -s http://localhost:3002 | grep -q "Next Golden Hour"; then
  echo "✓ Next Golden Hour card is present"
else
  echo "✗ Next Golden Hour card not found"
fi

# Test 5: Check interactive elements
echo ""
echo "5. Checking interactive elements..."
RESPONSE=$(curl -s http://localhost:3002)
if echo "$RESPONSE" | grep -q 'type="date"'; then
  echo "✓ Date picker present"
else
  echo "✗ Date picker not found"
fi

if echo "$RESPONSE" | grep -q 'placeholder.*location'; then
  echo "✓ Location input present"
else
  echo "✗ Location input not found"
fi

if echo "$RESPONSE" | grep -q 'Calculate'; then
  echo "✓ Calculate button present"
else
  echo "✗ Calculate button not found"
fi

echo ""
echo "=== TEST COMPLETE ==="
