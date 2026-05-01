const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public-movies')));

const db = new sqlite3.Database('./movies.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the movies database.');
});

db.run(`CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  director TEXT,
  year INTEGER,
  genre TEXT,
  rating INTEGER DEFAULT 0,
  watched INTEGER DEFAULT 0,
  review TEXT
)`);

const sampleMovies = [
  { title: 'Inception', director: 'Christopher Nolan', year: 2010, genre: 'Sci-Fi', rating: 9, watched: 1, review: 'Mind-bending masterpiece!' },
  { title: 'The Shawshank Redemption', director: 'Frank Darabont', year: 1994, genre: 'Drama', rating: 10, watched: 1, review: 'Timeless classic' },
  { title: 'The Dark Knight', director: 'Christopher Nolan', year: 2008, genre: 'Action', rating: 9, watched: 1, review: 'Best superhero movie ever' },
  { title: 'Interstellar', director: 'Christopher Nolan', year: 2014, genre: 'Sci-Fi', rating: 0, watched: 0, review: '' }
];

db.serialize(() => {
  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM movies');
  checkStmt.get((err, row) => {
    if (err) throw err;
    if (row.count === 0) {
      const insertStmt = db.prepare('INSERT INTO movies (title, director, year, genre, rating, watched, review) VALUES (?, ?, ?, ?, ?, ?, ?)');
      sampleMovies.forEach(movie => {
        insertStmt.run(movie.title, movie.director, movie.year, movie.genre, movie.rating, movie.watched, movie.review);
      });
      insertStmt.finalize();
      console.log('Sample movies added!');
    }
  });
  checkStmt.finalize();
});

app.get('/', (req, res) => {
  const filter = req.query.filter || 'all';
  let query = 'SELECT * FROM movies';
  const params = [];
  
  if (filter === 'watched') {
    query += ' WHERE watched = 1';
  } else if (filter === 'watchlist') {
    query += ' WHERE watched = 0';
  }
  
  query += ' ORDER BY year DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) throw err;
    res.render('movies', { movies: rows, filter });
  });
});

app.get('/add', (req, res) => {
  res.render('add-movie');
});

app.post('/add', (req, res) => {
  const { title, director, year, genre, rating, review } = req.body;
  const watched = req.body.watched ? 1 : 0;
  db.run('INSERT INTO movies (title, director, year, genre, rating, watched, review) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [title, director, year, genre, rating || 0, watched, review], 
    function(err) {
      if (err) {
        return console.log(err.message);
      }
      res.redirect('/');
    }
  );
});

app.get('/toggle/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM movies WHERE id = ?', [id], (err, movie) => {
    if (err) throw err;
    const newWatched = movie.watched ? 0 : 1;
    db.run('UPDATE movies SET watched = ? WHERE id = ?', [newWatched, id], function(err) {
      if (err) {
        return console.log(err.message);
      }
      res.redirect('/');
    });
  });
});

app.get('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM movies WHERE id = ?', [id], function(err) {
    if (err) {
      return console.log(err.message);
    }
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Movie Collection App running on http://localhost:${PORT}`);
});
