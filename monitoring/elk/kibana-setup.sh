#!/bin/bash
# ─── Kibana Setup Script ──────────────────────────────────────────────────────
# Run after ELK stack is up to configure index patterns and saved searches

KIBANA_URL="${KIBANA_URL:-http://localhost:5601}"

echo "⏳ Waiting for Kibana to be ready..."
until curl -s "$KIBANA_URL/api/status" | grep -q '"overall":{"level":"available"'; do
  sleep 5
done
echo "✅ Kibana is ready"

# ── Create Index Pattern ──────────────────────────────────────────────────────
echo "📊 Creating index pattern..."
curl -s -X POST "$KIBANA_URL/api/saved_objects/index-pattern/placement-tracker-logs" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "placement-tracker-logs-*",
      "timeFieldName": "@timestamp"
    }
  }'
echo ""

# ── Set as default index ──────────────────────────────────────────────────────
curl -s -X POST "$KIBANA_URL/api/kibana/settings" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{"changes": {"defaultIndex": "placement-tracker-logs"}}'
echo ""

# ── Create Saved Searches ─────────────────────────────────────────────────────
echo "🔍 Creating saved searches..."

# Error logs search
curl -s -X POST "$KIBANA_URL/api/saved_objects/search/placement-errors" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "PlaceTrack - Error Logs",
      "description": "All ERROR level logs from placement tracker",
      "hits": 0,
      "columns": ["@timestamp", "level", "message", "service"],
      "sort": [["@timestamp", "desc"]],
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query_string\":{\"query\":\"log_level:ERROR\",\"analyze_wildcard\":true}},\"filter\":[]}"
      }
    }
  }'
echo ""

# Auth events search
curl -s -X POST "$KIBANA_URL/api/saved_objects/search/placement-auth-events" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "PlaceTrack - Auth Events",
      "description": "Login and registration events",
      "columns": ["@timestamp", "message", "email"],
      "kibanaSavedObjectMeta": {
        "searchSourceJSON": "{\"query\":{\"query_string\":{\"query\":\"message:*login* OR message:*register*\",\"analyze_wildcard\":true}},\"filter\":[]}"
      }
    }
  }'
echo ""

echo "✅ Kibana configured successfully"
echo "   Open: $KIBANA_URL"
echo "   Index pattern: placement-tracker-logs-*"
