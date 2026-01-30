'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CURRENCIES } from '@/lib/currencies';
import AddExpenseForm from '../../components/AddExpenseForm';
import ExpenseItem from '../../components/ExpenseItem';
import DateRangePicker from '../../components/DateRangePicker';
import { Download, Filter } from 'lucide-react';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    // Filters
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(true);

    const categories = ['All', 'Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Other'];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserId(user.id);

            const [expensesData, settingsData] = await Promise.all([
                supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }),
                supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
            ]);

            setExpenses(expensesData.data || []);
            setSettings(settingsData.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (newExpense) => {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .insert([{
                    user_id: userId,
                    amount: newExpense.amount,
                    category: newExpense.category,
                    description: newExpense.description,
                    date: newExpense.date,
                }])
                .select();

            if (error) throw error;
            setExpenses([data[0], ...expenses]);
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Failed to add expense');
        }
    };

    const handleDeleteExpense = async (id) => {
        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id)
                .eq('user_id', userId);

            if (error) throw error;
            setExpenses(expenses.filter((e) => e.id !== id));
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const handleEditExpense = async (updatedExpense) => {
        try {
            const { error } = await supabase
                .from('expenses')
                .update({
                    amount: updatedExpense.amount,
                    category: updatedExpense.category,
                    description: updatedExpense.description,
                    date: updatedExpense.date,
                })
                .eq('id', updatedExpense.id)
                .eq('user_id', userId);

            if (error) throw error;
            setExpenses(expenses.map((e) => e.id === updatedExpense.id ? updatedExpense : e));
        } catch (error) {
            console.error('Error updating expense:', error);
        }
    };

    const handleDateQuickSelect = (type) => {
        const now = new Date();
        let start, end;

        if (type === 'thisMonth') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (type === 'last30') {
            start = new Date(now);
            start.setDate(start.getDate() - 30);
            end = now;
        } else if (type === 'all') {
            setStartDate('');
            setEndDate('');
            return;
        }

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const handleExportCSV = () => {
        const csvData = filteredExpenses.map(e =>
            `${e.date},${e.category},${e.description},${e.amount}`
        ).join('\n');

        const csv = `Date,Category,Description,Amount\n${csvData}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Filter logic
    const filteredExpenses = expenses.filter((expense) => {
        const categoryMatch = filterCategory === 'All' || expense.category === filterCategory;
        const searchMatch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());

        let dateMatch = true;
        if (startDate && endDate) {
            const expenseDate = new Date(expense.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            dateMatch = expenseDate >= start && expenseDate <= end;
        }

        return categoryMatch && searchMatch && dateMatch;
    });

    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const currencySymbol = settings ? CURRENCIES[settings.currency]?.symbol : 'Rs.';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 dark:text-gray-400">Loading expenses...</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Expenses</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage and track all your expenses
                        </p>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold cursor-pointer transition"
                    >
                        <Download size={20} />
                        Export CSV
                    </button>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left - Add Form (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <AddExpenseForm
                                onAddExpense={handleAddExpense}
                                currencySymbol={currencySymbol}
                            />
                        </div>
                    </div>

                    {/* Right - List & Filters */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Summary Card */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 p-6 rounded-xl shadow-lg text-white">
                            <p className="text-sm opacity-90">Total Expenses</p>
                            <p className="text-4xl font-bold mt-2">{currencySymbol}{total.toLocaleString()}</p>
                            <p className="text-sm opacity-75 mt-2">
                                Showing {filteredExpenses.length} of {expenses.length} expenses
                            </p>
                        </div>

                        {/* Filters Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                        >
                            <Filter size={20} />
                            <span className="font-semibold">
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </span>
                        </button>

                        {/* Filters Section */}
                        {showFilters && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors space-y-4">
                                {/* Date Range */}
                                <DateRangePicker
                                    startDate={startDate}
                                    endDate={endDate}
                                    onStartChange={setStartDate}
                                    onEndChange={setEndDate}
                                    onQuickSelect={handleDateQuickSelect}
                                />

                                {/* Category & Search */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium cursor-pointer"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Search
                                        </label>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search description..."
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                {(filterCategory !== 'All' || searchTerm || startDate || endDate) && (
                                    <button
                                        onClick={() => {
                                            setFilterCategory('All');
                                            setSearchTerm('');
                                            setStartDate('');
                                            setEndDate('');
                                        }}
                                        className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold cursor-pointer transition"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Expenses List */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                All Expenses
                            </h2>

                            {filteredExpenses.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {expenses.length === 0
                                            ? 'No expenses yet. Add your first expense!'
                                            : 'No expenses match your filters.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredExpenses.map((expense) => (
                                        <ExpenseItem
                                            key={expense.id}
                                            expense={expense}
                                            onDelete={handleDeleteExpense}
                                            onEdit={handleEditExpense}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}