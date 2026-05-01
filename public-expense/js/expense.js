let categoryChart;
let currentMonth = document.getElementById('monthSelect').value;

document.addEventListener('DOMContentLoaded', () => {
  initChart();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('monthSelect').addEventListener('change', (e) => {
    currentMonth = e.target.value;
    updateDashboard();
  });

  document.getElementById('expenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await addExpense();
  });
}

function initChart() {
  const ctx = document.getElementById('categoryChart').getContext('2d');
  
  const categoryData = getCategoryData();
  
  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categoryData),
      datasets: [{
        data: Object.values(categoryData),
        backgroundColor: [
          '#ff6b6b',
          '#00d9ff',
          '#ffd93d',
          '#c084fc',
          '#00ff88',
          '#888888'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#fff',
            padding: 20,
            font: {
              size: 14
            }
          }
        }
      }
    }
  });
}

function getCategoryData() {
  const categoryTotals = {};
  const rows = document.querySelectorAll('#expensesTableBody tr');
  rows.forEach(row => {
    const category = row.querySelector('.category-badge').textContent;
    const amountText = row.querySelector('.amount').textContent;
    const amount = parseFloat(amountText.replace('$', ''));
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
  });
  return categoryTotals;
}

async function updateDashboard() {
  try {
    const [expensesRes, statsRes] = await Promise.all([
      fetch(`/api/expenses?month=${currentMonth}`),
      fetch(`/api/stats?month=${currentMonth}`)
    ]);

    const expenses = await expensesRes.json();
    const stats = await statsRes.json();

    document.getElementById('totalAmount').textContent = `$${stats.total.toFixed(2)}`;
    document.getElementById('transactionCount').textContent = stats.count;
    document.getElementById('avgAmount').textContent = stats.count > 0 ? `$${(stats.total / stats.count).toFixed(2)}` : '$0.00';

    updateExpensesTable(expenses);
    updateChart(stats.categoryTotals);
  } catch (error) {
    console.error('Error updating dashboard:', error);
  }
}

function updateExpensesTable(expenses) {
  const tbody = document.getElementById('expensesTableBody');
  tbody.innerHTML = '';

  expenses.forEach(expense => {
    const row = document.createElement('tr');
    row.dataset.id = expense.id;
    row.innerHTML = `
      <td>${expense.date}</td>
      <td>${expense.description}</td>
      <td><span class="category-badge ${expense.category.toLowerCase()}">${expense.category}</span></td>
      <td class="amount">$${expense.amount.toFixed(2)}</td>
      <td><button class="delete-btn" onclick="deleteExpense(${expense.id})">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

function updateChart(categoryTotals) {
  categoryChart.data.labels = Object.keys(categoryTotals);
  categoryChart.data.datasets[0].data = Object.values(categoryTotals);
  categoryChart.update();
}

async function addExpense() {
  const expense = {
    description: document.getElementById('description').value,
    amount: document.getElementById('amount').value,
    category: document.getElementById('category').value,
    date: document.getElementById('date').value
  };

  try {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(expense)
    });

    if (response.ok) {
      document.getElementById('expenseForm').reset();
      document.getElementById('date').value = new Date().toISOString().slice(0, 10);
      await updateDashboard();
    }
  } catch (error) {
    console.error('Error adding expense:', error);
  }
}

async function deleteExpense(id) {
  if (confirm('Are you sure you want to delete this expense?')) {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await updateDashboard();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  }
}
