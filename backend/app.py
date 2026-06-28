import sqlite3
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

DATABASE = 'todos.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    # Create table with all columns including due_at
    conn.execute('''
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN NOT NULL DEFAULT 0,
            priority TEXT DEFAULT 'medium',
            category TEXT DEFAULT 'General',
            due_at TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Check for schema updates (migration)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(todos)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'priority' not in columns:
        conn.execute("ALTER TABLE todos ADD COLUMN priority TEXT DEFAULT 'medium'")
    if 'category' not in columns:
        conn.execute("ALTER TABLE todos ADD COLUMN category TEXT DEFAULT 'General'")
    if 'due_at' not in columns:
        conn.execute("ALTER TABLE todos ADD COLUMN due_at TEXT")
        
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

@app.route('/api/todos', methods=['GET'])
def get_todos():
    conn = get_db_connection()
    todos = conn.execute('SELECT * FROM todos ORDER BY created_at DESC').fetchall()
    conn.close()
    
    result = []
    for todo in todos:
        result.append({
            'id': todo['id'],
            'title': todo['title'],
            'description': todo['description'],
            'completed': bool(todo['completed']),
            'priority': todo['priority'] if todo['priority'] else 'medium',
            'category': todo['category'] if todo['category'] else 'General',
            'due_at': todo['due_at'],
            'created_at': todo['created_at']
        })
    return jsonify(result)

@app.route('/api/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    conn = get_db_connection()
    todo = conn.execute('SELECT * FROM todos WHERE id = ?', (todo_id,)).fetchone()
    conn.close()
    
    if todo is None:
        return jsonify({'error': 'Todo not found'}), 404
        
    return jsonify({
        'id': todo['id'],
        'title': todo['title'],
        'description': todo['description'],
        'completed': bool(todo['completed']),
        'priority': todo['priority'] if todo['priority'] else 'medium',
        'category': todo['category'] if todo['category'] else 'General',
        'due_at': todo['due_at'],
        'created_at': todo['created_at']
    })

@app.route('/api/todos', methods=['POST'])
def create_todo():
    data = request.get_json() or {}
    title = data.get('title')
    description = data.get('description', '')
    priority = data.get('priority', 'medium')
    category = data.get('category', 'General')
    due_at = data.get('due_at', None) # Expected format: ISO string or YYYY-MM-DDTHH:MM
    
    if not title or not title.strip():
        return jsonify({'error': 'Title is required'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO todos (title, description, completed, priority, category, due_at) VALUES (?, ?, 0, ?, ?, ?)',
        (title.strip(), description, priority, category, due_at)
    )
    conn.commit()
    todo_id = cursor.lastrowid
    
    # Retrieve the newly created todo
    todo = conn.execute('SELECT * FROM todos WHERE id = ?', (todo_id,)).fetchone()
    conn.close()
    
    return jsonify({
        'id': todo['id'],
        'title': todo['title'],
        'description': todo['description'],
        'completed': bool(todo['completed']),
        'priority': todo['priority'],
        'category': todo['category'],
        'due_at': todo['due_at'],
        'created_at': todo['created_at']
    }), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    conn = get_db_connection()
    todo = conn.execute('SELECT * FROM todos WHERE id = ?', (todo_id,)).fetchone()
    if todo is None:
        conn.close()
        return jsonify({'error': 'Todo not found'}), 404
        
    data = request.get_json() or {}
    title = data.get('title', todo['title'])
    description = data.get('description', todo['description'])
    completed = data.get('completed', todo['completed'])
    priority = data.get('priority', todo['priority'])
    category = data.get('category', todo['category'])
    due_at = data.get('due_at', todo['due_at'])
    
    completed_val = 1 if completed else 0
    
    conn.execute(
        'UPDATE todos SET title = ?, description = ?, completed = ?, priority = ?, category = ?, due_at = ? WHERE id = ?',
        (title.strip(), description, completed_val, priority, category, due_at, todo_id)
    )
    conn.commit()
    
    # Retrieve the updated todo
    updated_todo = conn.execute('SELECT * FROM todos WHERE id = ?', (todo_id,)).fetchone()
    conn.close()
    
    return jsonify({
        'id': updated_todo['id'],
        'title': updated_todo['title'],
        'description': updated_todo['description'],
        'completed': bool(updated_todo['completed']),
        'priority': updated_todo['priority'],
        'category': updated_todo['category'],
        'due_at': updated_todo['due_at'],
        'created_at': updated_todo['created_at']
    })

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    conn = get_db_connection()
    todo = conn.execute('SELECT * FROM todos WHERE id = ?', (todo_id,)).fetchone()
    if todo is None:
        conn.close()
        return jsonify({'error': 'Todo not found'}), 404
        
    conn.execute('DELETE FROM todos WHERE id = ?', (todo_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Todo deleted successfully'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
