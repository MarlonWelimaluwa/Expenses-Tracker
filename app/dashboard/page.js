'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import AddExpenseForm from '../components/AddExpenseForm';
import ExpenseItem from '../components/ExpenseItem';
import ThemeToggle from '../components/ThemeToggle';
import StatsCards from '../components/StatsCards';
import { LogOut } from 'lucide-react';


export default function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    const [filterCategory, setFilterCategory] = useState('All');
    const [filterMonth, setFilterMonth] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = ['All', 'Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Other'];

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            setUser(user);
            fetchExpenses(user.id);
        } catch (error) {
            console.error('Error checking user:', error);
            router.push('/login');
        }
    };

    const fetchExpenses = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });

            if (error) throw error;
            setExpenses(data || []);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (newExpense) => {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .insert([{
                    user_id: user.id,
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
            alert('Failed to add expense. Please try again.');
        }
    };

    const handleDeleteExpense = async (id) => {
        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;
            setExpenses(expenses.filter((expense) => expense.id !== id));
        } catch (error) {
            console.error('Error deleting expense:', error);
            alert('Failed to delete expense. Please try again.');
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
                .eq('user_id', user.id);

            if (error) throw error;
            setExpenses(expenses.map((expense) =>
                expense.id === updatedExpense.id ? updatedExpense : expense
            ));
        } catch (error) {
            console.error('Error updating expense:', error);
            alert('Failed to update expense. Please try again.');
        }
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.push('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const filteredExpenses = expenses.filter((expense) => {
        const categoryMatch = filterCategory === 'All' || expense.category === filterCategory;
        const expenseMonth = new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        const monthMatch = filterMonth === 'All' || expenseMonth === filterMonth;
        const searchMatch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && monthMatch && searchMatch;
    });

    const uniqueMonths = ['All', ...new Set(
        expenses.map(expense =>
            new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        )
    )];

    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
                <p className="text-xl text-gray-600 dark:text-gray-300">Loading expenses...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Fixed Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Spendly</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your spending</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Hello, <span className="font-semibold text-gray-800 dark:text-white">
                                        {user?.user_metadata?.username || 'User'}
                                    </span>
                        </p>
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 font-semibold cursor-pointer transition-all hover:scale-105 shadow-lg"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT COLUMN - STICKY FORM (Fixed height, no scroll) */}
                    <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] flex flex-col">
                        {/* Add Expense Form */}
                        <div className="flex-shrink-0">
                            <AddExpenseForm onAddExpense={handleAddExpense} />
                        </div>

                        {/* Stats Cards - fills remaining space */}
                        <div className="mt-4">
                            <StatsCards expenses={expenses} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN - SCROLLABLE EXPENSES */}
                    <div className="space-y-4">
                        {/* Total Card */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white p-6 rounded-lg shadow-lg transition-colors">
                            <p className="text-sm opacity-90">Total Expenses</p>
                            <p className="text-4xl font-bold">Rs. {total.toLocaleString()}</p>
                            <p className="text-xs opacity-75 mt-2">
                                Showing {filteredExpenses.length} of {expenses.length} expenses
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors">
                            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Filters</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium cursor-pointer transition-colors"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Month
                                    </label>
                                    <select
                                        value={filterMonth}
                                        onChange={(e) => setFilterMonth(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium cursor-pointer transition-colors"
                                    >
                                        {uniqueMonths.map((month) => (
                                            <option key={month} value={month}>{month}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search description..."
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium transition-colors"
                                    />
                                </div>

                                {(filterCategory !== 'All' || filterMonth !== 'All' || searchTerm !== '') && (
                                    <button
                                        onClick={() => {
                                            setFilterCategory('All');
                                            setFilterMonth('All');
                                            setSearchTerm('');
                                        }}
                                        className="w-full px-3 py-2 bg-gray-600 dark:bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Expenses List */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
                            <div className="p-4">
                                <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Recent Expenses</h2>
                                {filteredExpenses.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">
                                        {expenses.length === 0
                                            ? 'No expenses yet. Add your first expense!'
                                            : 'No expenses match your filters.'}
                                    </p>
                                ) : (
                                    <div className="space-y-2">
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
        </div>
    );
}