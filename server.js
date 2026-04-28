const express = require('express');
const cors = require('cors');
const db = require('./database');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function(err) {
    if (err) return res.status(400).json({ error: 'Username already exists' });
    res.json({ success: true, userId: this.lastID, username });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });
    res.json({ success: true, userId: user.id, username: user.username });
  });
});

app.get('/todos/:userId', (req, res) => {
  db.all('SELECT * FROM todos WHERE user_id = ?', [req.params.userId], (err, todos) => {
    res.json(todos || []);
  });
});

app.post('/todos', (req, res) => {
  const { text, userId } = req.body;
  db.run('INSERT INTO todos (text, user_id) VALUES (?, ?)', [text, userId], function(err) {
    db.get('SELECT * FROM todos WHERE id = ?', [this.lastID], (err, todo) => {
      res.json(todo);
    });
  });
});

app.put('/todos/:id', (req, res) => {
  db.get('SELECT * FROM todos WHERE id = ?', [req.params.id], (err, todo) => {
    if (!todo) return res.status(404).json({ error: 'Not found' });
    db.run('UPDATE todos SET done = ? WHERE id = ?', [todo.done ? 0 : 1, req.params.id], () => {
      db.get('SELECT * FROM todos WHERE id = ?', [req.params.id], (err, updated) => {
        res.json(updated);
      });
    });
  });
});

app.delete('/todos/:id', (req, res) => {
  db.run('DELETE FROM todos WHERE id = ?', [req.params.id], () => {
    res.json({ message: 'Deleted' });
  });
});

app.use(express.static('frontend'));

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});