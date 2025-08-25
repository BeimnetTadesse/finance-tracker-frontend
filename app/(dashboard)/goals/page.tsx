"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash, Clock, Check, Target, DollarSign, LineChart, Calendar } from 'lucide-react';

interface SavingGoal {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  description: string;
}

export default function SavingGoals() {
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);

  const [addMoneyModalOpen, setAddMoneyModalOpen] = useState(false);
  const [goalToFund, setGoalToFund] = useState<SavingGoal | null>(null);
  const [amountToAdd, setAmountToAdd] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    target_amount: "",
    current_amount: "",
    deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .substring(0, 10),
    description: "",
  });

  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.current_amount >= goal.target_amount).length;
  const totalTarget = goals.reduce(
    (sum, g) => sum + (Number(g.target_amount) || 0),
    0
  );
  const totalSaved = goals.reduce(
    (sum, g) => sum + (Number(g.current_amount) || 0),
    0
  );
  const totalRemaining = totalTarget - totalSaved;
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
      setToastMessage("");
    }, 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You must be logged in to view saving goals.");
      setGoals([]);
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get("http://localhost:8000/api/core/goals/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formattedData = response.data.map((g: any) => ({
        ...g,
        target_amount: Number(g.target_amount) || 0,
        current_amount: Number(g.current_amount) || 0,
      }));
      setGoals(formattedData);
    } catch (err) {
      console.error("Error fetching saving goals", err);
      setError("Failed to fetch saving goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteGoal = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this saving goal?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You must be logged in to delete a goal.");
        return;
      }
      await axios.delete(`http://localhost:8000/api/core/goals/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
      showToast("Saving goal deleted successfully.");
    } catch (err) {
      console.error("Error deleting goal", err);
      setError("Failed to delete the saving goal. Please try again.");
    }
  };

  const openCreateModal = () => {
    setEditingGoal(null);
    setFormData({
      title: "",
      target_amount: "",
      current_amount: "0",
      deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .substring(0, 10),
      description: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (goal: SavingGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      deadline: goal.deadline.substring(0, 10),
      description: goal.description,
    });
    setModalOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You must be logged in.");
      return;
    }
    const targetAmountNumber = parseFloat(formData.target_amount);
    const currentAmountNumber = parseFloat(formData.current_amount);
    if (isNaN(targetAmountNumber) || targetAmountNumber <= 0 || isNaN(currentAmountNumber) || currentAmountNumber < 0) {
      setError("Amounts must be positive numbers.");
      return;
    }
    const payload = {
      title: formData.title,
      target_amount: targetAmountNumber,
      current_amount: currentAmountNumber,
      deadline: formData.deadline,
      description: formData.description,
    };
    try {
      setError(null);
      if (editingGoal) {
        await axios.put(
          `http://localhost:8000/api/core/goals/${editingGoal.id}/`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `http://localhost:8000/api/core/goals/`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setModalOpen(false);
      fetchData();
      showToast("Saving goal saved successfully.");
    } catch (err) {
      console.error("Error saving goal", err);
      setError("Failed to save the saving goal. Please try again.");
    }
  };

  const openAddMoneyModal = (goal: SavingGoal) => {
    setGoalToFund(goal);
    setAmountToAdd("");
    setAddMoneyModalOpen(true);
  };

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalToFund) return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You must be logged in.");
      return;
    }
    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      setError("Amount must be a positive number.");
      return;
    }
    const newCurrentAmount = goalToFund.current_amount + amount;
    const payload = {
      ...goalToFund,
      current_amount: newCurrentAmount,
    };
    try {
      setError(null);
      await axios.put(
        `http://localhost:8000/api/core/goals/${goalToFund.id}/`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddMoneyModalOpen(false);
      fetchData();
      showToast(`$${amount.toFixed(2)} added to ${goalToFund.title}.`);
    } catch (err) {
      console.error("Error adding money", err);
      setError("Failed to add money. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-8">
      {/* Toast Notification */}
      {isToastVisible && (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-md shadow-lg bg-green-500 text-white">
          {toastMessage}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-purple-700">Saving Goals</h1>
            <p className="text-gray-600">Track your progress toward your financial goals.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-purple-700 text-white hover:bg-[#4658b8] h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Goal
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6 flex flex-col justify-between" style={{ minHeight: "140px" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total Goals</h3>
              <Target className="text-gray-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-purple-700 mt-2">{totalGoals}</div>
            <p className="text-xs text-gray-500 mt-1">{completedGoals} completed</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6 flex flex-col justify-between" style={{ minHeight: "140px" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total Target</h3>
              <DollarSign className="text-gray-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-purple-700 mt-2">${totalTarget.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Across all goals</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6 flex flex-col justify-between" style={{ minHeight: "140px" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total Saved</h3>
              <LineChart className="text-gray-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-green-600 mt-2">${totalSaved.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">{Math.round(overallProgress)}% of target</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6 flex flex-col justify-between" style={{ minHeight: "140px" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Remaining</h3>
              <Calendar className="text-gray-400" size={20} />
            </div>
            <div className={`text-3xl font-bold mt-2 ${totalRemaining >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
              ${totalRemaining.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">To reach all goals</p>
          </div>
        </div>

        {/* Overall Progress Section */}
        <div className="rounded-xl border border-gray-200 bg-white text-card-foreground shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">Overall Progress</h2>
              <p className="text-gray-600">Your total savings progress across all goals</p>
            </div>
            <div className="text-2xl font-bold text-purple-700">{Math.round(overallProgress)}%</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div className="h-2.5 rounded-full bg-purple-700" style={{ width: `${Math.min(overallProgress, 100)}%` }}></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <div className="font-semibold text-green-600">${totalSaved.toFixed(2)} saved</div>
            <div className="font-semibold text-purple-700">${totalTarget.toFixed(2)} target</div>
          </div>
        </div>

        {/* Goals List */}
        <div className="rounded-xl border border-gray-200 bg-white text-card-foreground shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-xl font-bold tracking-tight text-purple-700">All Saving Goals</h2>
            <p className="text-gray-600">
              {goals.length} total goals
            </p>
          </div>
          {error && (
            <p className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">{error}</p>
          )}

          {loading ? (
            <p className="text-purple-700 font-semibold">Loading saving goals...</p>
          ) : goals.length === 0 ? (
            <p className="text-gray-600">No saving goals found. Add one to get started!</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ minWidth: 0 }}>
              {goals.map((goal) => {
                const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                const isOverdue = new Date(goal.deadline) < new Date() && progress < 100;
                const progressColor = progress >= 100 ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-purple-700';

                return (
                  <div
                    key={goal.id}
                    className="rounded-lg border-t-4 border-purple-500 bg-white text-card-foreground shadow-md p-6 min-w-0"
                    style={{ overflowWrap: 'break-word' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-xl mb-1 break-words">{goal.title}</h3>
                        <p className="text-sm text-gray-600 break-words">{goal.description}</p>
                      </div>
                      <div className="flex gap-1 items-center">
                        <button onClick={() => openEditModal(goal)} className="p-1 rounded text-gray-500 hover:bg-gray-100">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => deleteGoal(goal.id)} className="p-1 rounded text-gray-500 hover:bg-gray-100">
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm text-gray-500 mb-2">Progress <span className="font-semibold text-purple-700">{Math.round(progress)}%</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${progressColor}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                        <div className="font-semibold text-green-600">${Number(goal.current_amount).toFixed(2)}</div>
                        <div className="font-semibold text-purple-700">${Number(goal.target_amount).toFixed(2)}</div>
                    </div>
                    
                    <div className="mt-4">
                      {isOverdue && (
                        <div className="flex items-center text-red-600 font-semibold text-sm mb-2">
                          <Clock size={16} className="mr-1" />
                          <span>Overdue: ${Math.max(0, goal.target_amount - goal.current_amount).toFixed(2)} to go</span>
                        </div>
                      )}
                      {!isOverdue && progress < 100 && (
                          <div className="flex items-center text-purple-700 font-semibold text-sm mb-2">
                            <span>${(goal.target_amount - goal.current_amount).toFixed(2)} to go</span>
                          </div>
                      )}
                      {progress >= 100 && (
                          <div className="flex items-center text-green-600 font-semibold text-sm mb-2">
                            <Check size={16} className="mr-1" />
                            <span>Goal Achieved!</span>
                          </div>
                      )}

                      <button
                        onClick={() => openAddMoneyModal(goal)}
                        className="w-full px-4 py-2 mt-2 rounded-md text-purple-700 bg-purple-100  transition text-sm font-semibold"
                      >
                        Add Money
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Modal for adding/editing a goal */}
      {modalOpen && (
    <div
    className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={() => setModalOpen(false)}
  >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              {editingGoal ? "Edit Saving Goal" : "Add New Saving Goal"}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block font-medium mb-1">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
              <div>
                <label htmlFor="target_amount" className="block font-medium mb-1">
                  Target Amount ($)
                </label>
                <input
                  id="target_amount"
                  name="target_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.target_amount}
                  onChange={handleFormChange}
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
              <div>
                <label htmlFor="current_amount" className="block font-medium mb-1">
                  Current Amount ($)
                </label>
                <input
                  id="current_amount"
                  name="current_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.current_amount}
                  onChange={handleFormChange}
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
              <div>
                <label htmlFor="deadline" className="block font-medium mb-1">
                  Deadline
                </label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={handleFormChange}
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
              <div>
                <label htmlFor="description" className="block font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="w-full rounded border border-gray-300 p-2"
                  rows={3}
                />
              </div>
              {error && <p className="text-red-600">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-purple-700 px-4 py-2 text-white hover:bg-[#4658b8]"
                >
                  {editingGoal ? "Save Changes" : "Add Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {addMoneyModalOpen && goalToFund && (
        <div
          className="fixed inset-0 bg-gray-100 bg-opacity-40 flex items-center justify-center z-50 p-4"
          onClick={() => setAddMoneyModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              Add Money to {goalToFund.title}
            </h3>
            <form onSubmit={handleAddMoney} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block font-medium mb-1">
                  Amount ($)
                </label>
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
              {error && <p className="text-red-600">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddMoneyModalOpen(false)}
                  className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-purple-700 px-4 py-2 text-white hover:bg-[#4658b8]"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
