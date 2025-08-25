'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  Target,
  HelpCircle,
  User,
  LogOut,
  Menu,
  X,
  PiggyBank,
  Scale,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import axios, { AxiosError } from 'axios';

interface Transaction {
  id: number;
  description: string;
  category: number | null;
  category_name?: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}

interface Category {
  id: number;
  name: string;
  type: 'IN' | 'EX';
}

interface BudgetItem {
  id: number;
  category: number;
  month: string;
  amount: number;
}

interface SavingsGoal {
  id: number;
  title: string;
  current_amount: number;
  target_amount: number;
}

interface SummaryData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  balanceChange: number;
  incomeChange: number;
  expensesChange: number;
  savingsChange: number;
}

const sidebarLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: CreditCard, label: 'Transactions' },
  { href: '/budgets', icon: Wallet, label: 'Budgets' },
  { href: '/goals', icon: Target, label: 'Savings Goals' },
  { href: '/help', icon: HelpCircle, label: 'Help & Support' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const summaryData: SummaryData = (() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

    const monthlyIncome = transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    const prevMonthlyIncome = transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(prevMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    const prevMonthlyExpenses = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(prevMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = transactions.reduce(
      (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
      0
    );

    const savingsRate =
      monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    const prevTotalBalance = transactions
      .filter((t) => new Date(t.date) < new Date(currentMonth))
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

    const balanceChange =
      prevTotalBalance !== 0
        ? ((totalBalance - prevTotalBalance) / Math.abs(prevTotalBalance)) * 100
        : 0;

    const incomeChange =
      prevMonthlyIncome !== 0
        ? ((monthlyIncome - prevMonthlyIncome) / prevMonthlyIncome) * 100
        : monthlyIncome > 0
        ? 100
        : 0;

    const expensesChange =
      prevMonthlyExpenses !== 0
        ? ((monthlyExpenses - prevMonthlyExpenses) / prevMonthlyExpenses) * 100
        : monthlyExpenses > 0
        ? 100
        : 0;

    const savingsChange =
      prevMonthlyIncome !== 0 && monthlyIncome !== 0
        ? ((monthlyIncome - monthlyExpenses) / monthlyIncome -
            (prevMonthlyIncome - prevMonthlyExpenses) / prevMonthlyIncome) *
          100
        : 0;

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      balanceChange,
      incomeChange,
      expensesChange,
      savingsChange,
    };
  })();

  const refreshToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      setError('No refresh token available. Please log in again.');
      router.push('/login');
      return null;
    }
    try {
      const response = await axios.post(
        'https://beimnettadesse.pythonanywhere.com/api/token/refresh/',
        { refresh: refreshToken }
      );
      const newAccessToken = response.data.access;
      localStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;
    } catch (err) {
      const error = err as AxiosError<{ detail?: string; message?: string }>;
      setError('Session expired. Please log in again.');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
      return null;
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('You must be logged in to view the dashboard.');
      setTransactions([]);
      setCategories([]);
      setBudgets([]);
      setSavingsGoals([]);
      setUsername(null);
      setLoading(false);
      router.push('/login');
      return;
    }
    try {
      const [profileRes, transactionsRes, categoriesRes, budgetsRes, goalsRes] = await Promise.all([
        axios.get('https://beimnettadesse.pythonanywhere.com/api/accounts/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('https://beimnettadesse.pythonanywhere.com/api/core/transactions/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('https://beimnettadesse.pythonanywhere.com/api/core/categories/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('https://beimnettadesse.pythonanywhere.com/api/core/budgets/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('https://beimnettadesse.pythonanywhere.com/api/core/goals/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsername(profileRes.data.username);

      const transactionsWithNames = transactionsRes.data.map((t: Transaction) => ({
        ...t,
        amount: Number(t.amount),
        type: t.type.toLowerCase() as 'income' | 'expense',
        category_name: categoriesRes.data.find((c: Category) => c.id === t.category)?.name || '—',
      }));

      const parsedBudgets = budgetsRes.data.map((b: BudgetItem) => ({
        ...b,
        amount: Number(b.amount),
      }));

      const parsedGoals = goalsRes.data.map((g: SavingsGoal) => ({
        ...g,
        current_amount: Number(g.current_amount),
        target_amount: Number(g.target_amount),
      }));

      setTransactions(transactionsWithNames);
      setCategories(categoriesRes.data);
      setBudgets(parsedBudgets);
      setSavingsGoals(parsedGoals);
    } catch (err) {
      const error = err as AxiosError<{ detail?: string; message?: string }>;
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      if (error.response?.status === 401 && errorMessage.includes('token not valid')) {
        const newToken = await refreshToken();
        if (newToken) {
          try {
            const [profileRes, transactionsRes, categoriesRes, budgetsRes, goalsRes] = await Promise.all([
              axios.get('https://beimnettadesse.pythonanywhere.com/api/accounts/profile/', {
                headers: { Authorization: `Bearer ${newToken}` },
              }),
              axios.get('https://beimnettadesse.pythonanywhere.com/api/core/transactions/', {
                headers: { Authorization: `Bearer ${newToken}` },
              }),
              axios.get('https://beimnettadesse.pythonanywhere.com/api/core/categories/', {
                headers: { Authorization: `Bearer ${newToken}` },
              }),
              axios.get('https://beimnettadesse.pythonanywhere.com/api/core/budgets/', {
                headers: { Authorization: `Bearer ${newToken}` },
              }),
              axios.get('https://beimnettadesse.pythonanywhere.com/api/core/goals/', {
                headers: { Authorization: `Bearer ${newToken}` },
              }),
            ]);

            setUsername(profileRes.data.username);

            const transactionsWithNames = transactionsRes.data.map((t: Transaction) => ({
              ...t,
              amount: Number(t.amount),
              type: t.type.toLowerCase() as 'income' | 'expense',
              category_name: categoriesRes.data.find((c: Category) => c.id === t.category)?.name || '—',
            }));

            const parsedBudgets = budgetsRes.data.map((b: BudgetItem) => ({
              ...b,
              amount: Number(b.amount),
            }));

            const parsedGoals = goalsRes.data.map((g: SavingsGoal) => ({
              ...g,
              current_amount: Number(g.current_amount),
              target_amount: Number(g.target_amount),
            }));

            setTransactions(transactionsWithNames);
            setCategories(categoriesRes.data);
            setBudgets(parsedBudgets);
            setSavingsGoals(parsedGoals);
          } catch (retryErr) {
            const retryError = retryErr as AxiosError<{ detail?: string; message?: string }>;
            setError(
              `Failed to load data after token refresh: ${
                retryError.response?.data?.detail || retryError.response?.data?.message || retryError.message
              }`
            );
            router.push('/login');
          }
        } else {
          setError('Failed to refresh token. Please log in again.');
          router.push('/login');
        }
      } else {
        setError(`Failed to load data: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getAmountSpent = (categoryId: number, month: string): number => {
    const monthStart = new Date(month);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    return transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.category === categoryId &&
          new Date(t.date) >= monthStart &&
          new Date(t.date) <= monthEnd
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/');
  };

  const formattedBudgets = budgets.map((budget) => ({
    id: budget.id,
    category: categories.find((c) => c.id === budget.category)?.name || 'Unknown',
    amount_spent: getAmountSpent(budget.category, budget.month),
    amount_total: budget.amount,
  }));

  const formattedSavingsGoals = savingsGoals.map((goal) => ({
    id: goal.id,
    goalName: goal.title,
    savedAmount: goal.current_amount,
    targetAmount: goal.target_amount,
  }));

  return (
    <div className="flex h-screen bg-gray-100 font-sans relative overflow-hidden">
      {!sidebarOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar menu"
        >
          <Menu className="w-6 h-6 text-purple-700" />
        </button>
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white p-6 shadow-lg flex flex-col justify-between
          transform transition-transform duration-300 ease-in-out z-40
          md:relative md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div>
          <div className="flex justify-between items-center mb-6 md:hidden">
            <span className="text-xl font-bold text-purple-700">FinanceMate</span>
            <button onClick={() => setSidebarOpen(false)} aria-label="Close sidebar menu">
              <X className="w-6 h-6 text-purple-700" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-2xl font-bold text-purple-700 mb-12">
            <LayoutDashboard className="w-6 h-6" />
            <span>FinanceMate</span>
          </div>

          <nav className="space-y-2">
            {sidebarLinks.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-purple-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={() => {
            handleLogout();
            setSidebarOpen(false);
          }}
          className="flex items-center gap-3 w-full text-red-500 hover:text-red-700 mt-10"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-transparent backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-y-auto w-full px-6 pt-20 md:pt-8 md:pl-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Welcome{username ? `, ${username}` : ''}
          </h1>

          {error && (
            <p className="mb-6 p-3 bg-red-100 text-red-700 rounded">{error}</p>
          )}

          {loading ? (
            <p className="text-purple-700 font-semibold">Loading dashboard...</p>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Total Balance</h3>
                    <Wallet className="text-gray-400" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-purple-700">
                    ${summaryData.totalBalance.toFixed(2)}
                  </div>
                  <div
                    className={`flex items-center mt-2 text-xs font-semibold ${
                      summaryData.balanceChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {summaryData.balanceChange >= 0 ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                    <span className="ml-1">{Math.abs(summaryData.balanceChange).toFixed(1)}%</span>
                    <span className="ml-1 text-gray-500 font-normal">from last month</span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Monthly Income</h3>
                    <PiggyBank className="text-gray-400" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    ${summaryData.monthlyIncome.toFixed(2)}
                  </div>
                  <div
                    className={`flex items-center mt-2 text-xs font-semibold ${
                      summaryData.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {summaryData.incomeChange >= 0 ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                    <span className="ml-1">{Math.abs(summaryData.incomeChange).toFixed(1)}%</span>
                    <span className="ml-1 text-gray-500 font-normal">from last month</span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Monthly Expenses</h3>
                    <CreditCard className="text-gray-400" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-red-600">
                    ${summaryData.monthlyExpenses.toFixed(2)}
                  </div>
                  <div
                    className={`flex items-center mt-2 text-xs font-semibold ${
                      summaryData.expensesChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {summaryData.expensesChange >= 0 ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                    <span className="ml-1">{Math.abs(summaryData.expensesChange).toFixed(1)}%</span>
                    <span className="ml-1 text-gray-500 font-normal">from last month</span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Savings Rate</h3>
                    <Scale className="text-gray-400" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-purple-700">
                    {summaryData.savingsRate.toFixed(1)}%
                  </div>
                  <div
                    className={`flex items-center mt-2 text-xs font-semibold ${
                      summaryData.savingsChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {summaryData.savingsChange >= 0 ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                    <span className="ml-1">{Math.abs(summaryData.savingsChange).toFixed(1)}%</span>
                    <span className="ml-1 text-gray-500 font-normal">from last month</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2 mb-8">
                <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold tracking-tight text-purple-700">
                      Recent Transactions
                    </h2>
                    <Link
                      href="/transactions"
                      className="text-sm font-medium text-purple-700 hover:text-[#4658b8]"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {transactions.slice(0, 4).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          ></div>
                          <div>
                            <h4 className="font-semibold">{transaction.description}</h4>
                            <p className="text-xs text-gray-500">{transaction.category_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}$
                            {Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">{transaction.date.substring(0, 10)}</p>
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <p className="text-gray-600">No recent transactions.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold tracking-tight text-purple-700">
                      Budget Overview
                    </h2>
                    <Link
                      href="/budgets"
                      className="text-sm font-medium text-purple-700 hover:text-[#4658b8]"
                    >
                      Manage
                    </Link>
                  </div>
                  <div className="space-y-6">
                    {formattedBudgets.map((budget) => {
                      const progress = (budget.amount_spent / budget.amount_total) * 100;
                      const isOverBudget = budget.amount_spent > budget.amount_total;
                      const progressColor = isOverBudget ? 'bg-red-500' : 'bg-green-500';
                      return (
                        <div key={budget.id}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-700">{budget.category}</span>
                            <span className="text-sm text-gray-500">
                              ${budget.amount_spent.toFixed(2)} / ${budget.amount_total.toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${progressColor}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                    {formattedBudgets.length === 0 && (
                      <p className="text-gray-600">No budgets set.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6 mt-8 mb-12">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-purple-700">
                      Savings Goals
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Track your progress towards financial goals
                    </p>
                  </div>
                  <Link
                    href="/goals"
                    className="text-sm font-medium text-purple-700 hover:text-[#4658b8]"
                  >
                    View All
                  </Link>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  {formattedSavingsGoals.map((goal) => {
                    const progress = (goal.savedAmount / goal.targetAmount) * 100;
                    return (
                      <div key={goal.id}>
                        <div className="flex justify-between items-end mb-2">
                          <span className="font-semibold text-gray-700">{goal.goalName}</span>
                          <span className="text-xs font-medium text-gray-500">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                          <div
                            className="h-2.5 rounded-full bg-purple-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>${goal.savedAmount.toLocaleString()}</span>
                          <span>${goal.targetAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                  {formattedSavingsGoals.length === 0 && (
                    <p className="text-gray-600">No savings goals set.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}