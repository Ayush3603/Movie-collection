const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public-expense')));

const db = new sqlite3.Database('./expenses.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the expenses database.');
});

db.run(`CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL
)`);

const sampleExpenses = [
  { description: 'Grocery Shopping', amount: 125.50, category: 'Food', date: '2026-05-01' },
  { description: 'Electric Bill', amount: 89.00, category: 'Utilities', date: '2026-05-01' },
  { description: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', date: '2026-04-30' },
  { description: 'Gas', amount: 45.00, category: 'Transport', date: '2026-04-29' },
  { description: 'Restaurant', amount: 65.00, category: 'Food', date: '2026-04-28' },
  { description: 'New Shoes', amount: 99.99, category: 'Shopping', date: '2026-04-27' }
];

db.serialize(() => {
  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM expenses');
  checkStmt.get((err, row) => {
    if (err) throw err;
    if (row.count === 0) {
      const insertStmt = db.prepare('INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)');
      sampleExpenses.forEach(expense => {
        insertStmt.run(expense.description, expense.amount, expense.category, expense.date);
      });
      insertStmt.finalize();
      console.log('Sample expenses added!');
    }
  });
  checkStmt.finalize();
});

app.get('/', (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const [year, monthNum] = month.split('-');
  const startDate = `${year}-${monthNum}-01`;
  const endDate = `${year}-${monthNum}-31`;

  db.all('SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC', [startDate, endDate], (err, expenses) => {
    if (err) throw err;

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryTotals = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    res.render('expense-dashboard', { 
      expenses, 
      month, 
      total, 
      categoryTotals,
      categories: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Other']
    });
  });
});

app.get('/api/expenses', (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const [year, monthNum] = month.split('-');
  const startDate = `${year}-${monthNum}-01`;
  const endDate = `${year}-${monthNum}-31`;

  db.all('SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC', [startDate, endDate], (err, expenses) => {
    if (err) throw err;
    res.json(expenses);
  });
});

app.post('/api/expenses', (req, res) => {
  const { description, amount, category, date } = req.body;
  db.run('INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)', 
    [description, parseFloat(amount), category, date], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, description, amount: parseFloat(amount), category, date });
    }
  );
});

app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM expenses WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

app.get('/api/stats', (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const [year, monthNum] = month.split('-');
  const startDate = `${year}-${monthNum}-01`;
  const endDate = `${year}-${monthNum}-31`;

  db.all('SELECT * FROM expenses WHERE date BETWEEN ? AND ?', [startDate, endDate], (err, expenses) => {
    if (err) throw err;

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryTotals = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    res.json({ total, categoryTotals, count: expenses.length });
  });
});

app.listen(PORT, () => {
  console.log(`Expense Tracker Dashboard running on http://localhost:${PORT}`);
});
