"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { Plus, Pencil, Trash, CreditCard, PiggyBank, Scale } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string;
  type: "IN" | "EX";
}

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

interface BudgetItem {
  id: number;
  category: number;
  month: string;
  amount: number;
}

export default function Budgets() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);

  const [formData, setFormData] = useState<{
    category: string;
    month: string;
    amount: string;
  }>({
    category: "",
    month: new Date().toISOString().substring(0, 7) + "-01",
    amount: "",
  });

  // Refresh token function
  const refreshToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      setError("No refresh token available. Please log in again.");
      return null;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/token/refresh/", {
        refresh: refreshToken,
      });
      const newAccessToken = response.data.access;
      localStorage.setItem("accessToken", newAccessToken);
      console.log("Token refreshed successfully");
      return newAccessToken;
    } catch (err) {
      const error = err as AxiosError<{ detail?: string; message?: string }>;
      console.error("Token refresh failed:", {
        message: error.response?.data?.detail || error.message,
        status: error.response?.status,
      });
      setError("Session expired. Please log in again.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return null;
    }
  };

  // Fetch all data with token refresh handling
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    let token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You must be logged in to view budgets.");
      setBudgets([]);
      setCategories([]);
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      const [categoriesRes, budgetsRes, transactionsRes] = await Promise.all([
        axios.get<Category[]>("http://localhost:8000/api/core/categories/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get<BudgetItem[]>("http://localhost:8000/api/core/budgets/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get<Transaction[]>("http://localhost:8000/api/core/transactions/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      console.log("Categories response:", categoriesRes.data);
      console.log("Budgets response:", budgetsRes.data);
      console.log("Transactions response:", transactionsRes.data);

      // Convert budget.amount to number
      const parsedBudgets = budgetsRes.data.map((budget) => ({
        ...budget,
        amount: Number(budget.amount), // Convert string to number
      }));

      setCategories(categoriesRes.data);
      setBudgets(parsedBudgets);
      setTransactions(
        transactionsRes.data.map((t) => ({
          ...t,
          amount: Number(t.amount),
          type: t.type.toLowerCase() as "income" | "expense",
          category_name:
            categoriesRes.data.find((c) => c.id === t.category)?.name || "—",
        }))
      );
    } catch (err) {
      const error = err as AxiosError<{ detail?: string; message?: string }>;
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message;

      if (error.response?.status === 401 && errorMessage.includes("token not valid")) {
        console.log("Attempting to refresh token...");
        const newToken = await refreshToken();
        if (newToken) {
          try {
            const [categoriesRes, budgetsRes, transactionsRes] = await Promise.all([
              axios.get<Category[]>("http://localhost:8000/api/core/categories/", {
                headers: { Authorization: `Bearer ${newToken}` },
              }),
              axios.get<BudgetItem[]>("http://localhost:8000/api/core/budgets/", {
                headers: { Authorization: `Bearer ${newToken}` },
              }),
              axios.get<Transaction[]>("http://localhost:8000/api/core/transactions/", {
                headers: { Authorization: `Bearer ${newToken}` },
              }),
            ]);

            console.log("Categories response (after refresh):", categoriesRes.data);
            console.log("Budgets response (after refresh):", budgetsRes.data);
            console.log("Transactions response (after refresh):", transactionsRes.data);

            // Convert budget.amount to number
            const parsedBudgets = budgetsRes.data.map((budget) => ({
              ...budget,
              amount: Number(budget.amount),
            }));

            setCategories(categoriesRes.data);
            setBudgets(parsedBudgets);
            setTransactions(
              transactionsRes.data.map((t) => ({
                ...t,
                amount: Number(t.amount),
                type: t.type.toLowerCase() as "income" | "expense",
                category_name:
                  categoriesRes.data.find((c) => c.id === t.category)?.name || "—",
              }))
            );
          } catch (retryErr) {
            const retryError = retryErr as AxiosError<{ detail?: string; message?: string }>;
            const retryMessage =
              retryError.response?.data?.detail ||
              retryError.response?.data?.message ||
              retryError.message;
            console.error("Retry failed:", {
              message: retryMessage,
              status: retryError.response?.status,
              data: retryError.response?.data,
            });
            setError(`Failed to load data: ${retryMessage}`);
          }
        } else {
          setError("Failed to refresh token. Please log in again.");
        }
      } else {
        console.error("Failed to fetch data:", {
          message: errorMessage,
          status: error.response?.status,
          headers: error.response?.headers,
          data: error.response?.data,
        });
        setError(`Failed to load data: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCategoryName = (categoryId: number): string => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Unknown";
  };

  const getAmountSpent = (categoryId: number, month: string): number => {
    const monthStart = new Date(month);
    const monthEnd = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0
    );
    return transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === categoryId &&
          new Date(t.date) >= monthStart &&
          new Date(t.date) <= monthEnd
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const totalBudget = budgets.reduce(
    (sum, b) => sum + (isNaN(b.amount) ? 0 : b.amount),
    0
  );
  const totalSpent = budgets.reduce(
    (sum, b) => sum + getAmountSpent(b.category, b.month),
    0
  );
  const totalRemaining = totalBudget - totalSpent;

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
      setToastMessage("");
    }, 3000);
  };

  const deleteBudget = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    let token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You must be logged in to delete a budget.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/core/budgets/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
      showToast("Budget deleted successfully.");
    } catch (err) {
      const error = err as AxiosError<{ detail?: string; message?: string }>;
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message;

      if (error.response?.status === 401 && errorMessage.includes("token not valid")) {
        console.log("Attempting to refresh token for delete...");
        const newToken = await refreshToken();
        if (newToken) {
          try {
            await axios.delete(`http://localhost:8000/api/core/budgets/${id}/`, {
              headers: { Authorization: `Bearer ${newToken}` },
            });
            await fetchData();
            showToast("Budget deleted successfully.");
          } catch (retryErr) {
            const retryError = retryErr as AxiosError<{ detail?: string; message?: string }>;
            const retryMessage =
              retryError.response?.data?.detail ||
              retryError.response?.data?.message ||
              retryError.message;
            console.error("Delete retry failed:", {
              message: retryMessage,
              status: retryError.response?.status,
              data: retryError.response?.data,
            });
            setError(`Failed to delete the budget: ${retryMessage}`);
          }
        } else {
          setError("Failed to refresh token. Please log in again.");
        }
      } else {
        console.error("Error deleting budget:", {
          message: errorMessage,
          status: error.response?.status,
          data: error.response?.data,
        });
        setError(`Failed to delete the budget: ${errorMessage}`);
      }
    }
  };

  const openCreateModal = () => {
    setEditingBudget(null);
    setFormData({
      category: "",
      month: new Date().toISOString().substring(0, 7) + "-01",
      amount: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (budget: BudgetItem) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category.toString(),
      month: budget.month,
      amount: budget.amount.toString(),
    });
    setModalOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNumber = parseFloat(formData.amount);
    const categoryId = Number(formData.category);

    if (
      isNaN(amountNumber) ||
      amountNumber <= 0 ||
      isNaN(categoryId) ||
      categoryId <= 0 ||
      !formData.month
    ) {
      setError("Please select a valid category, month, and enter a positive amount.");
      return;
    }

    const payload = {
      category: categoryId,
      month: formData.month,
      amount: amountNumber,
    };

    let token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You must be logged in.");
      return;
    }

    try {
      setError(null);
      if (editingBudget) {
        await axios.put(
          `http://localhost:8000/api/core/budgets/${editingBudget.id}/`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast("Budget updated successfully.");
      } else {
        await axios.post(
          "http://localhost:8000/api/core/budgets/",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast("Budget added successfully.");
      }
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      const error = err as AxiosError<{ detail?: string; message?: string }>;
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message;

      if (error.response?.status === 401 && errorMessage.includes("token not valid")) {
        console.log("Attempting to refresh token for save...");
        const newToken = await refreshToken();
        if (newToken) {
          try {
            if (editingBudget) {
              await axios.put(
                `http://localhost:8000/api/core/budgets/${editingBudget.id}/`,
                payload,
                { headers: { Authorization: `Bearer ${newToken}` } }
              );
              showToast("Budget updated successfully.");
            } else {
              await axios.post(
                "http://localhost:8000/api/core/budgets/",
                payload,
                { headers: { Authorization: `Bearer ${newToken}` } }
              );
              showToast("Budget added successfully.");
            }
            setModalOpen(false);
            await fetchData();
          } catch (retryErr) {
            const retryError = retryErr as AxiosError<{ detail?: string; message?: string }>;
            const retryMessage =
              retryError.response?.data?.detail ||
              retryError.response?.data?.message ||
              retryError.message;
            console.error("Save retry failed:", {
              message: retryMessage,
              status: retryError.response?.status,
              data: retryError.response?.data,
            });
            setError(`Failed to save the budget: ${retryMessage}`);
          }
        } else {
          setError("Failed to refresh token. Please log in again.");
        }
      } else {
        console.error("Error saving budget:", {
          message: errorMessage,
          status: error.response?.status,
          data: error.response?.data,
        });
        setError(`Failed to save the budget: ${errorMessage}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-8">
      {isToastVisible && (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-md shadow-lg bg-green-500 text-white">
          {toastMessage}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-purple-700">
              Budgets
            </h1>
            <p className="text-gray-600">
              Manage your spending categories and track your progress.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-purple-700 text-white hover:bg-[#4658b8] h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Budget
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div
            className="rounded-xl border border-gray-200 bg-white shadow-lg p-6 flex flex-col justify-between"
            style={{ minHeight: "140px" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total Budget</h3>
              <CreditCard className="text-gray-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-purple-700 mt-2">
              ${totalBudget.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all categories</p>
          </div>
          <div
            className="rounded-xl border border-gray-200 bg-white shadow-lg p-6 flex flex-col justify-between"
            style={{ minHeight: "140px" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
              <PiggyBank className="text-gray-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              ${totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all categories</p>
          </div>
          <div
            className="rounded-xl border border-gray-200 bg-white shadow-lg p-6 flex flex-col justify-between"
            style={{ minHeight: "140px" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Remaining</h3>
              <Scale className="text-gray-400" size={20} />
            </div>
            <div
              className={`text-3xl font-bold mt-2 ${
                totalRemaining >= 0 ? "text-purple-700" : "text-red-600"
              }`}
            >
              ${totalRemaining.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">To stay within budget</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white text-card-foreground shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-xl font-bold tracking-tight text-purple-700">
              All Budgets
            </h2>
            <p className="text-gray-600">{budgets.length} total budgets</p>
          </div>
          {error && (
            <p className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </p>
          )}

          {loading ? (
            <p className="text-purple-700 font-semibold">Loading budgets...</p>
          ) : budgets.length === 0 ? (
            <p className="text-gray-600">
              No budgets found. Add one to get started!
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {budgets.map((budget) => {
                const amountSpent = getAmountSpent(budget.category, budget.month);
                const amount = isNaN(budget.amount) ? 0 : budget.amount;
                const remaining = Math.max(amount - amountSpent, 0);
                const remainingPercent = amount > 0 ? (remaining / amount) * 100 : 0;
                const isOverBudget = amountSpent > amount;
                const barColor = isOverBudget ? "bg-red-500" : "bg-green-500";

                return (
                  <div
                    key={budget.id}
                    className="rounded-lg border-t-4 border-purple-500 bg-white text-card-foreground shadow-md p-6"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-xl mb-1">
                          {getCategoryName(budget.category)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ${amountSpent.toFixed(2)} of ${amount.toFixed(2)} spent
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            isOverBudget
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isOverBudget ? "Over Budget" : "On Track"}
                        </span>
                        <button
                          onClick={() => openEditModal(budget)}
                          className="p-1 rounded text-gray-500 hover:bg-gray-100"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => deleteBudget(budget.id)}
                          className="p-1 rounded text-gray-500 hover:bg-gray-100"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm text-gray-500 mb-2">
                        Money Left{" "}
                        <span className="font-semibold text-purple-700">
                          ${remaining.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`${barColor} h-2.5 rounded-full`}
                          style={{ width: `${remainingPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <div className="font-semibold">
                        Remaining: ${remaining.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
       <div
       className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
       onClick={() => setModalOpen(false)}
     >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-full overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-purple-700">
              {editingBudget ? "Edit Budget" : "Add Budget"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="category"
                  className="block mb-1 font-semibold"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Select category</option>
                  {categories
                    .filter((cat) => cat.type === "EX")
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label htmlFor="month" className="block mb-1 font-semibold">
                  Month
                </label>
                <input
                  type="date"
                  id="month"
                  name="month"
                  value={formData.month}
                  onChange={handleFormChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="amount" className="block mb-1 font-semibold">
                  Budget Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleFormChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-purple-700 text-white hover:bg-purple-800 transition w-full sm:w-auto"
                >
                  {editingBudget ? "Save Changes" : "Add Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}