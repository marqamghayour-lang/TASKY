# TASKY - Elegant Full-Stack TODO Application

TaskFlow is a premium task management application built with a **Python Flask backend** (with SQLite database) and a modern **React (Vite) frontend**.

It is fully prepared for local network testing, direct IP hits, and standard CLI/API client checks.

---

## 🏗️ Architecture

- **Backend**: Python 3 (Flask) + SQLite (for task storage) + CORS enabled. Port `5000`.
- **Frontend**: React 19 (Vite) + CSS custom variables (designed for dark and light modes). Port `5173`.

---

## 🚀 Getting Started

To run the entire application (both frontend and backend) simultaneously:

```bash
./run_app.sh
```

This script will:
1. Kill any existing processes running on ports `5000` (Flask) and `5173` (React/Vite).
2. Start the backend and frontend in the background.
3. Automatically find and display your local network IP (e.g. `192.168.1.X`), allowing you to hit the app from other devices (direct IP hit).
4. Stream server logs to `backend.log` and `frontend.log`.
5. Clean up and shut down both servers when you press `Ctrl+C`.

---

## 🔍 Validation Checks

Here is how you can verify the application using different methods.

### 1. Curl Check (Command Line)
You can use the built-in validation script to run a automated CRUD testing suite with curl:
```bash
./test_api.sh
```

Or you can run individual curl commands manually:

**Create a Todo Task:**
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Verify Flask Backend", "description": "Ensure the API functions correctly"}'
```

**Get all Todo Tasks:**
```bash
curl http://localhost:5000/api/todos
```

**Update a Todo Task (Complete it):**
```bash
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

**Delete a Todo Task:**
```bash
curl -X DELETE http://localhost:5000/api/todos/1
```

---

### 2. Postman Check
You can import the API calls to Postman:
- Set up a collection with base URL `http://localhost:5000` or `http://<your-ip>:5000`
- Use the following endpoints:
  - `GET` `/api/todos` — Get all tasks
  - `POST` `/api/todos` — Create a task (JSON body: `{"title": "...", "description": "..."}`)
  - `PUT` `/api/todos/<id>` — Update task (JSON body: `{"completed": true/false}`)
  - `DELETE` `/api/todos/<id>` — Delete task

---

### 3. Direct IP Hit (Browser Check)
- Run `./run_app.sh` to obtain the system's local IP address (e.g. `http://192.168.10.2:5173/`).
- Visit `http://<your-ip>:5173/` from any device connected to the same local network (phone, tablet, other PC).
- The React application is configured to dynamically route all requests to the API server at `http://<your-ip>:5000` (rather than hardcoded to `localhost`), which allows complete functionality when accessed via direct IP hit.
