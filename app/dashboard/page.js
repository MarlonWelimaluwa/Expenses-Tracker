'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { CURRENCIES } from '@/lib/currencies';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

export default function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState([]);
    const [recurring, setRecurring] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [expensesData, incomeData, recurringData, settingsData] = await Promise.all([
                supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }),
                supabase.from('income').select('*').eq('user_id', user.id).order('date', { ascending: false }),
                supabase.from('recurring_expenses').select('*').eq('user_id', user.id).eq('is_active', true).order('next_date', { ascending: true }),
                supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
            ]);

            setExpenses(expensesData.data || []);
            setIncome(incomeData.data || []);
            setRecurring(recurringData.data || []);
            setSettings(settingsData.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const currencySymbol = settings ? CURRENCIES[settings.currency]?.symbol : 'Rs.';

    // Calculate totals
    const thisMonthExpenses = expenses
        .filter(e => {
            const expenseDate = new Date(e.date);
            const now = new Date();
            return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, e) => sum + e.amount, 0);

    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const balance = totalIncome - expenses.reduce((sum, e) => sum + e.amount, 0);

    const budgetPercentage = settings?.monthly_budget > 0
        ? (thisMonthExpenses / settings.monthly_budget) * 100
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Welcome Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Your financial overview at a glance</p>
                </div>

                {/* Top Stats - 3 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Balance */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-6 rounded-xl shadow-lg text-white">
                        <p className="text-sm opacity-90">Balance</p>
                        <p className="text-3xl font-bold mt-2">{currencySymbol}{balance.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                            {balance >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <p className="text-sm opacity-90">
                                {balance >= 0 ? 'Positive' : 'Negative'}
                            </p>
                        </div>
                    </div>

                    {/* This Month Expenses */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-6 rounded-xl shadow-lg text-white">
                        <p className="text-sm opacity-90">This Month</p>
                        <p className="text-3xl font-bold mt-2">{currencySymbol}{thisMonthExpenses.toLocaleString()}</p>
                        <p className="text-sm opacity-75 mt-2">
                            {budgetPercentage > 0 ? `${budgetPercentage.toFixed(0)}% of budget` : 'No budget set'}
                        </p>
                    </div>

                    {/* Total Income */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 p-6 rounded-xl shadow-lg text-white">
                        <p className="text-sm opacity-90">Total Income</p>
                        <p className="text-3xl font-bold mt-2">{currencySymbol}{totalIncome.toLocaleString()}</p>
                        <p className="text-sm opacity-75 mt-2">{income.length} entries</p>
                    </div>
                </div>

                {/* Budget Progress */}
                {settings?.monthly_budget > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Monthly Budget</h2>
                            <span className="text-lg font-bold text-gray-800 dark:text-white">
                {budgetPercentage.toFixed(0)}%
              </span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                            <div
                                className={`h-4 rounded-full transition-all ${
                                    budgetPercentage >= 90 ? 'bg-red-500' :
                                        budgetPercentage >= 70 ? 'bg-yellow-500' :
                                            'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(100, budgetPercentage)}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {currencySymbol}{thisMonthExpenses.toLocaleString()} spent
              </span>
                            <span className="text-gray-600 dark:text-gray-400">
                of {currencySymbol}{settings.monthly_budget.toLocaleString()}
              </span>
                        </div>

                        {budgetPercentage >= 90 && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2 font-semibold">
                                ⚠️ {budgetPercentage >= 100 ? 'OVER BUDGET!' : 'Close to limit!'}
                            </p>
                        )}
                    </div>
                )}

                {/* Two Column Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upcoming Bills */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Upcoming Bills</h2>
                            <button
                                onClick={() => router.push('/dashboard/recurring')}
                                className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 cursor-pointer"
                            >
                                View All <ArrowRight size={16} />
                            </button>
                        </div>

                        {recurring.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                                No upcoming bills
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recurring.slice(0, 3).map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white text-sm">
                                                {item.description || item.category}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                Due: {item.next_date}
                                            </p>
                                        </div>
                                        <p className="font-bold text-gray-800 dark:text-white">
                                            {currencySymbol}{item.amount}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Savings Summary */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Savings</h2>
                            <button
                                onClick={() => router.push('/dashboard/savings')}
                                className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 cursor-pointer"
                            >
                                Manage <ArrowRight size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Regular Savings */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700 dark:text-gray-300">💰 Regular Savings</span>
                                    <span className="font-semibold text-gray-800 dark:text-white">
                    {settings?.regular_savings_goal > 0
                        ? `${((settings.regular_savings_current / settings.regular_savings_goal) * 100).toFixed(0)}%`
                        : '0%'}
                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{
                                            width: `${settings?.regular_savings_goal > 0
                                                ? Math.min(100, (settings.regular_savings_current / settings.regular_savings_goal) * 100)
                                                : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Emergency Fund */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700 dark:text-gray-300">🚨 Emergency Fund</span>
                                    <span className="font-semibold text-gray-800 dark:text-white">
                    {settings?.emergency_goal > 0
                        ? `${((settings.emergency_current / settings.emergency_goal) * 100).toFixed(0)}%`
                        : '0%'}
                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-red-500 h-2 rounded-full"
                                        style={{
                                            width: `${settings?.emergency_goal > 0
                                                ? Math.min(100, (settings.emergency_current / settings.emergency_goal) * 100)
                                                : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Investments */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700 dark:text-gray-300">📈 Investments</span>
                                    <span className="font-semibold text-gray-800 dark:text-white">
                    {settings?.investment_goal > 0
                        ? `${((settings.investment_current / settings.investment_goal) * 100).toFixed(0)}%`
                        : '0%'}
                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-purple-500 h-2 rounded-full"
                                        style={{
                                            width: `${settings?.investment_goal > 0
                                                ? Math.min(100, (settings.investment_current / settings.investment_goal) * 100)
                                                : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Expenses */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Expenses</h2>
                        <button
                            onClick={() => router.push('/dashboard/expenses')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 cursor-pointer"
                        >
                            View All <ArrowRight size={16} />
                        </button>
                    </div>

                    {expenses.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                            No expenses yet
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {expenses.slice(0, 5).map((expense) => (
                                <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white text-sm">
                                            {expense.category}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {expense.description} • {expense.date}
                                        </p>
                                    </div>
                                    <p className="font-bold text-gray-800 dark:text-white">
                                        {currencySymbol}{expense.amount.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => router.push('/dashboard/expenses')}
                        className="p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg transition-all hover:scale-105 cursor-pointer"
                    >
                        + Add Expense
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/income')}
                        className="p-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg shadow-lg transition-all hover:scale-105 cursor-pointer"
                    >
                        + Add Income
                    </button>
                </div>
            </div>
        </div>
    );
}