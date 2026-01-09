#!/bin/bash

echo "=== Test API POST /api/device ==="
echo ""

# Test với deviceId hợp lệ
echo "Test 1: Gửi deviceId hợp lệ"
curl -X POST http://localhost:3000/api/device \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"device-123"}' \
  -w "\n\nStatus Code: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X POST http://localhost:3000/api/device \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"device-123"}' \
  -w "\n\nStatus Code: %{http_code}\n"

echo ""
echo "---"
echo ""

# Test không có deviceId
echo "Test 2: Gửi request không có deviceId (sẽ báo lỗi)"
curl -X POST http://localhost:3000/api/device \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\n\nStatus Code: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X POST http://localhost:3000/api/device \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\n\nStatus Code: %{http_code}\n"

echo ""
echo "=== Test hoàn tất ==="
