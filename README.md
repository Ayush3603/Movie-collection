# Mini Project Collection

This repository contains three mini web applications built with Node.js, Express, SQLite, and EJS.

## Projects Included

### 1. Enhanced Movie Collection & Watchlist
A modern movie collection application with watch links and a rewards/badges system.

**Features:**
- Add movies with details (title, director, year, genre, rating, review)
- "Watch Now" links to streaming services
- Badges/rewards system based on movies watched
- Filter by "All", "Watched", or "Watchlist"
- Beautiful UI with animations

**Run:**
```bash
npm start
```
Runs at: http://localhost:3000

### 2. Expense Tracker Dashboard
A comprehensive expense tracker with visualizations and statistics.

**Features:**
- Add, delete, and view expenses
- Filter by month/year
- Category-wise expense chart (Chart.js)
- Statistics cards (total spent, transaction count, average)
- REST API for CRUD operations

**Run:**
```bash
npm run expense
```

### 3. Todo List
A simple todo list application.

**Features:**
- Add, mark as done/undone, delete todos
- SQLite database for persistence

**Run:**
```bash
npm run todo
```

## Installation & Setup

1. Clone or download this repository
2. Install dependencies:
```bash
npm install
```
3. Run any of the applications using the commands above

## Technologies Used
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **EJS** - Templating engine
- **Chart.js** - Data visualization
- **CSS3** - Styling
- **Git** - Version control

## Project Structure
```
mini prj/
├── movie-server-enhanced.js  # Enhanced movie app
├── expense-server.js          # Expense tracker
├── server.js                  # Todo list
├── package.json
├── .gitignore
├── README.md
├── views/                     # EJS templates
├── public-movies/            # Movie app assets
├── public-expense/           # Expense tracker assets
└── public/                   # Todo list assets
```

## License
MIT
