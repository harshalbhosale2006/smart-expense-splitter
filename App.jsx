
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/expenses";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // READ: Fetch all expenses
  const fetchExpenses = async () => {
    try {
      setError("");

      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Unable to load expenses");
      }

      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Cannot connect to backend. Check whether your server is running.");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // CREATE and UPDATE expense
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !paidBy.trim() || Number(amount) <= 0) {
      setError("Please enter a valid title, amount and payer.");
      return;
    }

    const expenseData = {
      title: title.trim(),
      amount: Number(amount),
      paidBy: paidBy.trim(),
    };

    try {
      setLoading(true);
      setError("");

      const url = editingId ? `${API}/${editingId}` : API;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Operation failed");
      }

      resetForm();
      await fetchExpenses();
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Unable to save expense.");
    } finally {
      setLoading(false);
    }
  };

  // EDIT: Load expense into form
  const handleEdit = (expense) => {
    setTitle(expense.title);
    setAmount(expense.amount);
    setPaidBy(expense.paidBy);
    setEditingId(expense._id);
    setError("");
  };

  // DELETE: Remove expense
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Delete failed");
      }

      await fetchExpenses();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || "Unable to delete expense.");
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle("");
    setAmount("");
    setPaidBy("");
    setEditingId(null);
    setError("");
  };

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  return (
    <div className="app">
      <header>
        <h1>Smart Expense Splitter</h1>
        <p>Manage and track your expenses easily</p>
      </header>

      <main>
        <section className="summary">
          <h2>Total Expenses</h2>
          <h1>₹{total.toFixed(2)}</h1>
          <p>{expenses.length} expense records</p>
        </section>

        <section className="form-section">
          <h2>{editingId ? "Update Expense" : "Add New Expense"}</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Expense title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />

            <input
              type="text"
              placeholder="Paid by"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : editingId
                ? "Update Expense"
                : "Add Expense"}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </form>
        </section>

        {error && <p className="error">{error}</p>}

        <section className="expenses-section">
          <h2>Recent Expenses</h2>

          {expenses.length === 0 ? (
            <p>No expenses found. Add your first expense!</p>
          ) : (
            <div className="expense-list">
              {expenses.map((expense) => (
                <div className="expense-item" key={expense._id}>
                  <div>
                    <h3>{expense.title}</h3>
                    <p>Paid by: {expense.paidBy}</p>
                  </div>

                  <div>
                    <strong>₹{Number(expense.amount).toFixed(2)}</strong>
                    <div className="actions">
                      <button onClick={() => handleEdit(expense)}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(expense._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
