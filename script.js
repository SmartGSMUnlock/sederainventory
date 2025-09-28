function toggleDarkMode() {
  document.body.classList.toggle("dark");

  const darkmodeBtn = document.querySelector(".darkmode-toggle");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    darkmodeBtn.textContent = "☀️"; // sun icon
  } else {
    localStorage.setItem("theme", "light");
    darkmodeBtn.textContent = "🌙"; // moon icon
  }
}

// Apply saved theme on load
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const darkmodeBtn = document.querySelector(".darkmode-toggle");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    darkmodeBtn.textContent = "☀️";
  } else {
    document.body.classList.remove("dark");
    darkmodeBtn.textContent = "🌙";
  }
});

// --- Login Modal Control ---
function openLogin() {
  document.getElementById("loginModal").classList.remove("hidden");
}
function closeLogin() {
  document.getElementById("loginModal").classList.add("hidden");
}

// --- Login Logic ---
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === "admin" && password === "1234") {
    localStorage.setItem("loggedIn", "true");
    alert("Login successful!");
    window.location.href = "admin/admin.html"; // redirect to admin panel
  } else {
    alert("Invalid username or password!");
  }
}

// --- Sales Logic ---
const salesForm = document.getElementById("salesForm");
const salesBody = document.getElementById("salesBody");
const grandTotalEl = document.getElementById("grandTotal");
const overallProfitEl = document.getElementById("overallProfit");

let grandTotal = 0;
let overallProfit = 0;

if (salesForm) {
  // Handle item type change
  document.getElementById("itemType").addEventListener("change", function() {
    const itemType = this.value;
    if (itemType === "Charger") {
      document.getElementById("chargerTypeContainer").classList.remove("hidden");
      document.getElementById("modelContainer").classList.add("hidden");
    } else {
      document.getElementById("chargerTypeContainer").classList.add("hidden");
      document.getElementById("modelContainer").classList.remove("hidden");
    }
  });

  salesForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const itemType = document.getElementById("itemType").value;
    const chargerType = itemType === "Charger" ? document.getElementById("chargerType").value : "";
    const model = itemType !== "Charger" ? document.getElementById("model").value : "";
    const quantity = parseInt(document.getElementById("quantity").value);
    const price = parseFloat(document.getElementById("price").value);
    const capital = parseFloat(document.getElementById("capital").value);

    const total = quantity * price;
    const profit = (price - capital) * quantity;
    const now = new Date().toLocaleString();

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${now}</td>
      <td>${itemType}</td>
      <td>${model || "-"}</td>
      <td>${chargerType || "-"}</td>
      <td>${quantity}</td>
      <td>₱${price}</td>
      <td>₱${capital}</td>
      <td>₱${total}</td>
      <td>₱${profit}</td>
      <td>
        <button onclick="editRow(this)">✏️</button>
        <button onclick="deleteRow(this, ${total}, ${profit})">🗑️</button>
      </td>
    `;
    salesBody.appendChild(row);

    grandTotal += total;
    overallProfit += profit;
    grandTotalEl.textContent = `₱${grandTotal}`;
    overallProfitEl.textContent = `₱${overallProfit}`;

    updateChart();
    salesForm.reset();
    document.getElementById("chargerTypeContainer").classList.add("hidden");
    document.getElementById("modelContainer").classList.add("hidden");
  });
}

// Delete Row
function deleteRow(btn, total, profit) {
  if (confirm("Are you sure you want to delete this entry?")) {
    btn.closest("tr").remove();
    grandTotal -= total;
    overallProfit -= profit;
    grandTotalEl.textContent = `₱${grandTotal}`;
    overallProfitEl.textContent = `₱${overallProfit}`;
    updateChart();
  }
}

// Edit Row
function editRow(btn) {
  const row = btn.closest("tr").children;
  const itemType = row[1].textContent;

  document.getElementById("itemType").value = itemType;

  if (itemType === "Charger") {
    document.getElementById("chargerTypeContainer").classList.remove("hidden");
    document.getElementById("modelContainer").classList.add("hidden");
    document.getElementById("chargerType").value = row[3].textContent !== "-" ? row[3].textContent : "Micro";
  } else {
    document.getElementById("chargerTypeContainer").classList.add("hidden");
    document.getElementById("modelContainer").classList.remove("hidden");
    document.getElementById("model").value = row[2].textContent !== "-" ? row[2].textContent : "";
  }

  document.getElementById("quantity").value = row[4].textContent;
  document.getElementById("price").value = row[5].textContent.replace("₱", "");
  document.getElementById("capital").value = row[6].textContent.replace("₱", "");

  row[9].parentElement.remove();
}

// --- Expenses Logic ---
const expenseForm = document.getElementById("expenseForm");
const expenseBody = document.getElementById("expenseBody");
const totalExpensesEl = document.getElementById("totalExpenses");

let totalExpenses = 0;

if (expenseForm) {
  expenseForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const expenseName = document.getElementById("expenseName").value;
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    const now = new Date().toLocaleString();

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${now}</td>
      <td>${expenseName}</td>
      <td>₱${amount}</td>
      <td><button onclick="deleteExpense(this, ${amount})">🗑️</button></td>
    `;
    expenseBody.appendChild(row);

    totalExpenses += amount;
    totalExpensesEl.textContent = `₱${totalExpenses}`;

    updateChart();
    expenseForm.reset();
  });
}

function deleteExpense(btn, amount) {
  if (confirm("Delete this expense?")) {
    btn.closest("tr").remove();
    totalExpenses -= amount;
    totalExpensesEl.textContent = `₱${totalExpenses}`;
    updateChart();
  }
}

// --- Chart.js Overview ---
if (document.getElementById("overviewChart")) {
  const ctx = document.getElementById("overviewChart").getContext("2d");
  var overviewChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Sales", "Expenses", "Profit"],
      datasets: [{
        label: "Overview",
        data: [0, 0, 0],
        backgroundColor: ["#28a745", "#dc3545", "#007bff"]
      }]
    },
    options: { responsive: true }
  });

  function updateChart() {
    overviewChart.data.datasets[0].data = [grandTotal, totalExpenses, overallProfit];
    overviewChart.update();
  }
}
document.getElementById("salesForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const formData = new FormData(this);

  fetch("add_sale.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.text())
  .then(data => {
    if (data.includes("success")) {
      alert("Sale added!");
      this.reset();
    } else {
      alert("Error saving sale: " + data);
    }
  });
});
