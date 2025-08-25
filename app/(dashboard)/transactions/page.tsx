"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Search } from "lucide-react";

// Define the data interfaces for type safety
interface Transaction {
  id: number;
  date: string;
  description: string;
  category: number | null;
  category_id?: number;
  category_name?: string;
  type: "income" | "expense";
  amount: number;
  is_recurring?: boolean;
}

interface Category {
  id: number;
  name: string;
  type: "IN" | "EX";
}

export default function Transactions() {
  // State for all transactions and categories fetched from the API
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // State for filtering and searching
  const [filterType, setFilterType] = useState<"All" | "income" | "expense">("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  // State for error handling
  const [error, setError] = useState<string | null>(null);

  // State for the modal (Add/Edit Transaction form)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // State for the form data
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category_id: "",
    type: "income",
    is_recurring: false,
    date: new Date().toISOString().substring(0, 10),
  });

  // Calculate totals for the summary cards
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  // Function to fetch all data and populate state
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You must be logged in to view transactions.");
      setTransactions([]);
      setLoading(false);
      return;
    }
    try {
      // Use Promise.all to fetch both transactions and categories concurrently
      const [transactionsRes, categoriesRes] = await Promise.all([
        axios.get("https://beimnettadesse.pythonanywhere.com/api/core/transactions/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://beimnettadesse.pythonanywhere.com/api/core/categories/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const categoriesData = categoriesRes.data;
      const transactionsData = transactionsRes.data;

      // Map category names to transactions after both requests are complete
      const transactionsWithNames = transactionsData.map((t: Transaction) => ({
        ...t,
        amount: Number(t.amount),
        type: t.type.toLowerCase(),
        category_name:
          categoriesData.find((c: Category) => c.id === t.category)?.name || "—",
      }));

      // Set the state with the fully processed data
      setTransactions(transactionsWithNames);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error fetching data", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteTransaction = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You must be logged in to delete transactions.");
        return;
      }

      await axios.delete(`https://beimnettadesse.pythonanywhere.com/api/core/transactions/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Re-fetch all data to ensure the list is up-to-date
      fetchData();
    } catch (err) {
      console.error("Error deleting transaction", err);
      setError("Failed to delete the transaction. Please try again.");
    }
  };

  const openCreateModal = () => {
    setEditingTransaction(null);
    setFormData({
      description: "",
      amount: "",
      category_id: "",
      type: "income",
      is_recurring: false,
      date: new Date().toISOString().substring(0, 10),
    });
    setModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      category_id: transaction.category ? transaction.category.toString() : "",
      type: transaction.type,
      is_recurring: transaction.is_recurring || false,
      date: transaction.date
        ? transaction.date.substring(0, 10)
        : new Date().toISOString().substring(0, 10),
    });
    setModalOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "type" ? { category_id: "" } : {}),
      }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You must be logged in.");
      return;
    }

    const amountNumber = parseFloat(formData.amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    if (!editingTransaction && !formData.category_id) {
      setError("Please select a category.");
      return;
    }

    const payload: any = {
      description: formData.description,
      amount: amountNumber,
      type: formData.type,
      is_recurring: formData.is_recurring,
      date: formData.date,
    };

    if (formData.category_id) {
      payload.category = Number(formData.category_id);
    }

    try {
      setError(null);

      if (editingTransaction) {
        await axios.put(
          `https://beimnettadesse.pythonanywhere.com/api/core/transactions/${editingTransaction.id}/`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `https://beimnettadesse.pythonanywhere.com/api/core/transactions/`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setModalOpen(false);
      // Re-fetch all data to ensure the list is up-to-date
      fetchData();
    } catch (err) {
      console.error("Error saving transaction", err);
      setError("Failed to save the transaction. Please try again.");
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || t.type === filterType;
    const matchesCategory =
      filterCategory === "All" || t.category === Number(filterCategory);
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-8">
      {/* Header and Buttons */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-purple-700">
              Transactions
            </h1>
            <p className="text-gray-600">
              View and manage all your financial transactions.
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-purple-700 text-white hover:bg-[#4658b8] h-10 px-4 py-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </button>
          </div>
        </div>

      {/* Summary Cards - taller and stronger shadow */}
<div className="grid gap-6 md:grid-cols-3">
  {[
    { title: "Total Income", value: totalIncome, color: "green" },
    { title: "Total Expenses", value: totalExpenses, color: "red" },
    {
      title: "Net Income",
      value: netIncome,
      color: netIncome >= 0 ? "green" : "red",
    },
  ].map(({ title, value, color }) => (
    <div
      key={title}
      className="rounded-lg border border-gray-200 bg-white text-card-foreground shadow-lg p-8 flex flex-col justify-between"
      style={{ minHeight: "140px", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
    >
      <div className="pb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      </div>
      <div>
        <div
          className={`text-3xl font-bold ${
            color === "green" ? "text-green-600" : "text-red-600"
          }`}
        >
          {title === "Net Income" && value >= 0 ? "+" : ""}
          {title === "Net Income" && value < 0 ? "-" : ""}
          ${Math.abs(value).toFixed(2)}
        </div>
      </div>
    </div>
  ))}
</div>


        {/* Filters Section - lighter border, shadow, smooth */}
        <div
          className="rounded-xl border border-gray-200 bg-white text-card-foreground shadow-md p-6 transition-shadow hover:shadow-lg"
          style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
        >
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-purple-700">
              Filters
            </h2>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium mb-1"
              >
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="search"
                  placeholder="Search transactions..."
                  className="pl-9 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-[180px]">
              <label
                htmlFor="category-filter"
                className="block text-sm font-medium mb-1"
              >
                Category
              </label>
              <select
                id="category-filter"
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories
                  .filter(
                    (cat) =>
                      filterType === "All" ||
                      (filterType === "income" && cat.type === "IN") ||
                      (filterType === "expense" && cat.type === "EX")
                  )
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="sm:w-[180px]">
              <label
                htmlFor="type-filter"
                className="block text-sm font-medium mb-1"
              >
                Type
              </label>
              <select
                id="type-filter"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as any);
                  setFilterCategory("All");
                }}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-700"
              >
                <option value="All">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div
          className="rounded-xl border border-gray-200 bg-white text-card-foreground shadow-md p-6 mt-6 transition-shadow hover:shadow-lg"
          style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold tracking-tight text-purple-700">
              Recent Transactions
            </h2>
            <p className="text-gray-600">
              {filteredTransactions.length} of {transactions.length} total
              transactions
            </p>
          </div>

          {error && (
            <p className="mb-6 p-3 bg-red-100 text-red-700 rounded">{error}</p>
          )}

          {loading ? (
            <p className="text-purple-700 font-semibold">Loading...</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-gray-600">No transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-purple-100 text-purple-700">
                  <tr>
                    <th className="py-3 px-3 sm:px-6 text-left whitespace-nowrap">
                      Date
                    </th>
                    <th className="py-3 px-3 sm:px-6 text-left whitespace-nowrap">
                      Description
                    </th>
                    <th className="py-3 px-3 sm:px-6 text-left whitespace-nowrap">
                      Category
                    </th>
                    <th className="py-3 px-3 sm:px-6 text-left whitespace-nowrap">
                      Type
                    </th>
                    <th className="py-3 px-3 sm:px-6 text-right whitespace-nowrap">
                      Amount
                    </th>
                    <th className="py-3 px-3 sm:px-6 text-center whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr
                      key={t.id}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-3 sm:px-6 whitespace-nowrap">
                        {t.date.substring(0, 10)}
                      </td>
                      <td className="py-3 px-3 sm:px-6">{t.description}</td>
                      <td className="py-3 px-3 sm:px-6 whitespace-nowrap">
                        {t.category_name || "—"}
                      </td>
                      <td className="py-3 px-3 sm:px-6 capitalize whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            t.type === "income"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-3 sm:px-6 text-right font-semibold whitespace-nowrap ${
                          t.type === "income" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 sm:px-6 text-center whitespace-nowrap flex justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => openEditModal(t)}
                          className="text-blue-600 hover:underline font-medium whitespace-nowrap"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          className="text-red-600 hover:underline font-medium whitespace-nowrap"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
       <div
       className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
       onClick={() => setModalOpen(false)}
     >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-full overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-purple-700">
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
            </h2>

            {error && (
              <p className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</p>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Description
                </label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                />
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium mb-1"
                >
                  Amount
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium mb-1"
                >
                  Date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                />
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium mb-1"
                >
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="category_id"
                  className="block text-sm font-medium mb-1"
                >
                  Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                >
                  <option value="">Select a category</option>
                  {categories
                    .filter(
                      (cat) =>
                        formData.type === "income"
                          ? cat.type === "IN"
                          : cat.type === "EX"
                    )
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="is_recurring"
                  name="is_recurring"
                  type="checkbox"
                  checked={formData.is_recurring}
                  onChange={handleFormChange}
                  className="rounded border-gray-300 text-purple-700 focus:ring-purple-700"
                />
                <label htmlFor="is_recurring" className="text-sm font-medium">
                  Recurring transaction
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-[#4658b8] focus:outline-none focus:ring-2 focus:ring-purple-700"
                >
                  {editingTransaction ? "Save" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
