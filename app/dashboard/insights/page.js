'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CURRENCIES } from '@/lib/currencies';
import { BarChart3, TrendingDown, TrendingUp, PieChart, Calendar } from 'lucide-react';

export default function InsightsPage() {
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [expensesData, incomeData, settingsData] = await Promise.all([
                supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }),
                supabase.from('income').select('*').eq('user_id', user.id),
                supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
            ]);

            setExpenses(expensesData.data || []);
            setIncome(incomeData.data || []);
            setSettings(settingsData.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const currencySymbol = settings ? CURRENCIES[settings.currency]?.symbol : 'Rs.';

    // Calculate this month vs last month
    const now = new Date();
    const thisMonth = expenses.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const lastMonth = expenses.filter(e => {
        const date = new Date(e.date);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
    });

    const thisMonthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthTotal = lastMonth.reduce((sum, e) => sum + e.amount, 0);
    const monthDifference = thisMonthTotal - lastMonthTotal;
    const monthPercentChange = lastMonthTotal > 0 ? ((monthDifference / lastMonthTotal) * 100) : 0;

    // Category breakdown
    const categoryTotals = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {});

    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Calculate max for scaling bars
    const maxCategoryAmount = sortedCategories[0]?.[1] || 1;

    // Income vs Expenses
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    // Average daily spending
    const daysWithExpenses = [...new Set(expenses.map(e => e.date))].length;
    const avgDailySpending = daysWithExpenses > 0 ? totalExpenses / daysWithExpenses : 0;

    // Spending by day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const byDayOfWeek = expenses.reduce((acc, e) => {
        const day = new Date(e.date).getDay();
        acc[day] = (acc[day] || 0) + e.amount;
        return acc;
    }, {});

    const dayOfWeekData = dayNames.map((name, index) => ({
        name,
        amount: byDayOfWeek[index] || 0
    }));

    const maxDayAmount = Math.max(...dayOfWeekData.map(d => d.amount), 1);

    // Last 6 months trend
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthExpenses = expenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate.getMonth() === date.getMonth() &&
                expenseDate.getFullYear() === date.getFullYear();
        });

        last6Months.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            amount: monthExpenses.reduce((sum, e) => sum + e.amount, 0)
        });
    }

    const maxMonthAmount = Math.max(...last6Months.map(m => m.amount), 1);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 dark:text-gray-400">Loading insights...</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Insights</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Analyze your spending patterns and trends
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Month Comparison */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            {monthPercentChange >= 0 ? (
                                <TrendingUp className="text-red-600" size={20} />
                            ) : (
                                <TrendingDown className="text-green-600" size={20} />
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400">vs Last Month</p>
                        </div>
                        <p className={`text-2xl font-bold ${monthPercentChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {monthPercentChange >= 0 ? '+' : ''}{monthPercentChange.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {currencySymbol}{Math.abs(monthDifference).toLocaleString()} {monthPercentChange >= 0 ? 'more' : 'less'}
                        </p>
                    </div>

                    {/* Net Balance */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="text-blue-600" size={20} />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Net Balance</p>
                        </div>
                        <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {currencySymbol}{Math.abs(netBalance).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {netBalance >= 0 ? 'Surplus' : 'Deficit'}
                        </p>
                    </div>

                    {/* Average Daily */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="text-purple-600" size={20} />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Daily</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {currencySymbol}{avgDailySpending.toFixed(0)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Over {daysWithExpenses} days
                        </p>
                    </div>

                    {/* Total Expenses */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <PieChart className="text-orange-600" size={20} />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {currencySymbol}{totalExpenses.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {expenses.length} transactions
                        </p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Last 6 Months Trend */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                            Last 6 Months Trend
                        </h2>
                        <div className="space-y-3">
                            {last6Months.map((item, index) => (
                                <div key={index}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">{item.month}</span>
                                        <span className="font-semibold text-gray-800 dark:text-white">
                      {currencySymbol}{item.amount.toLocaleString()}
                    </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${(item.amount / maxMonthAmount) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top 5 Categories */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                            Top 5 Categories
                        </h2>
                        <div className="space-y-3">
                            {sortedCategories.map(([category, amount], index) => {
                                const percentage = (amount / totalExpenses) * 100;
                                const colors = [
                                    'from-red-500 to-red-600',
                                    'from-blue-500 to-blue-600',
                                    'from-green-500 to-green-600',
                                    'from-yellow-500 to-yellow-600',
                                    'from-purple-500 to-purple-600',
                                ];

                                return (
                                    <div key={category}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600 dark:text-gray-400">{category}</span>
                                            <span className="font-semibold text-gray-800 dark:text-white">
                        {currencySymbol}{amount.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                            <div
                                                className={`bg-gradient-to-r ${colors[index]} h-3 rounded-full transition-all duration-500`}
                                                style={{ width: `${(amount / maxCategoryAmount) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Spending by Day of Week */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                            Spending by Day of Week
                        </h2>
                        <div className="space-y-3">
                            {dayOfWeekData.map((item, index) => (
                                <div key={item.name}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                                        <span className="font-semibold text-gray-800 dark:text-white">
                      {currencySymbol}{item.amount.toLocaleString()}
                    </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${(item.amount / maxDayAmount) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Income vs Expenses */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                            Income vs Expenses
                        </h2>
                        <div className="space-y-6">
                            {/* Income */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">Total Income</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">
                    {currencySymbol}{totalIncome.toLocaleString()}
                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                    <div className="bg-green-500 h-4 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>

                            {/* Expenses */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">Total Expenses</span>
                                    <span className="font-bold text-red-600 dark:text-red-400">
                    {currencySymbol}{totalExpenses.toLocaleString()}
                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                    <div
                                        className="bg-red-500 h-4 rounded-full transition-all duration-500"
                                        style={{ width: `${totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Net */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Net Balance</span>
                                    <span className={`font-bold text-xl ${netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {netBalance >= 0 ? '+' : ''}{currencySymbol}{netBalance.toLocaleString()}
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Insights Summary */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 p-6 rounded-xl shadow-lg text-white">
                    <h2 className="text-2xl font-bold mb-4">📊 Key Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                            <p className="font-semibold mb-1">Highest Spending Category</p>
                            <p className="text-2xl font-bold">
                                {sortedCategories[0]?.[0] || 'N/A'}
                            </p>
                            <p className="text-sm opacity-90">
                                {currencySymbol}{sortedCategories[0]?.[1]?.toLocaleString() || 0}
                            </p>
                        </div>

                        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                            <p className="font-semibold mb-1">Most Expensive Day</p>
                            <p className="text-2xl font-bold">
                                {dayOfWeekData.sort((a, b) => b.amount - a.amount)[0]?.name}
                            </p>
                            <p className="text-sm opacity-90">
                                {currencySymbol}{dayOfWeekData.sort((a, b) => b.amount - a.amount)[0]?.amount.toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                            <p className="font-semibold mb-1">Monthly Trend</p>
                            <p className="text-2xl font-bold">
                                {monthPercentChange >= 0 ? '↑' : '↓'} {Math.abs(monthPercentChange).toFixed(1)}%
                            </p>
                            <p className="text-sm opacity-90">
                                {monthPercentChange >= 0 ? 'Spending up' : 'Spending down'} from last month
                            </p>
                        </div>

                        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                            <p className="font-semibold mb-1">Savings Rate</p>
                            <p className="text-2xl font-bold">
                                {totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0}%
                            </p>
                            <p className="text-sm opacity-90">
                                Of income saved
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}