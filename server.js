const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./todos.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the todos database.');
});

db.run(`CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0
)`);

app.get('/', (req, res) => {
  db.all('SELECT * FROM todos', [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.render('index', { todos: rows });
  });
});

app.post('/add', (req, res) => {
  const { title } = req.body;
  db.run('INSERT INTO todos (title) VALUES (?)', [title], function(err) {
    if (err) {
      return console.log(err.message);
    }
    res.redirect('/');
  });
});

app.get('/toggle/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM todos WHERE id = ?', [id], (err, todo) => {
    if (err) {
      throw err;
    }
    const newCompleted = todo.completed ? 0 : 1;
    db.run('UPDATE todos SET completed = ? WHERE id = ?', [newCompleted, id], function(err) {
      if (err) {
        return console.log(err.message);
      }
      res.redirect('/');
    });
  });
});

app.get('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM todos WHERE id = ?', [id], function(err) {
    if (err) {
      return console.log(err.message);
    }
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
