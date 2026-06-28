#!/bin/bash

# Port of Flask backend API
API_PORT=5000
API_URL="http://localhost:${API_PORT}/api/todos"

echo "=== TASKFLOW API CURL TEST SYSTEM ==="
echo "Testing endpoint: $API_URL"
echo ""

# 1. Add a todo item
echo "1. POST (Create) a new Todo item..."
CREATE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Need milk, eggs, and freshly brewed coffee"}' \
  "$API_URL")
echo "Response: $CREATE_RESPONSE"
echo ""

# Extract the ID of the created todo using Python JSON parser
TODO_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")

if [ -z "$TODO_ID" ] || [ "$TODO_ID" == "None" ]; then
  echo "Error: Failed to create or parse todo ID."
  exit 1
fi
echo "Parsed Todo ID: $TODO_ID"
echo ""

# 2. Get all todo items
echo "2. GET (Retrieve) all Todo items..."
GET_ALL_RESPONSE=$(curl -s -X GET "$API_URL")
echo "Response: $GET_ALL_RESPONSE"
echo ""

# 3. Get single todo item
echo "3. GET (Retrieve) single Todo item (ID: $TODO_ID)..."
GET_SINGLE_RESPONSE=$(curl -s -X GET "${API_URL}/${TODO_ID}")
echo "Response: $GET_SINGLE_RESPONSE"
echo ""

# 4. Update the todo item (toggle completed)
echo "4. PUT (Update/Toggle complete) Todo item (ID: $TODO_ID)..."
UPDATE_RESPONSE=$(curl -s -X PUT \
  -H "Content-Type: application/json" \
  -d '{"completed": true}' \
  "${API_URL}/${TODO_ID}")
echo "Response: $UPDATE_RESPONSE"
echo ""

# 5. Delete the todo item
echo "5. DELETE Todo item (ID: $TODO_ID)..."
DELETE_RESPONSE=$(curl -s -X DELETE "${API_URL}/${TODO_ID}")
echo "Response: $DELETE_RESPONSE"
echo ""

echo "=== API CURL TESTS COMPLETED SUCCESSFULLY ==="
