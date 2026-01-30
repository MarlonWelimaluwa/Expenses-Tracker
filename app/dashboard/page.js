'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, Settings as SettingsIcon } from 'lucide-react';
import { CURRENCIES } from '@/lib/currencies';

import AddExpenseForm from '../components/AddExpenseForm';
import ExpenseItem from '../components/ExpenseItem';
import ThemeToggle from '../components/ThemeToggle';
import StatsCards from '../components/StatsCards';
import SettingsModal from '../components/SettingsModal';
import SavingsCards from '../components/SavingsCards';
import IncomeTracker from '../components/IncomeTracker';
import BudgetProgress from '../components/BudgetProgress';
import DateRangePicker from '../components/DateRangePicker';

import RecurringExpenses from '../components/RecurringExpenses';


export default function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const router = useRouter();

    const [recurring, setRecurring] = useState([]);

    // Filter states
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
            await Promise.all([
                fetchExpenses(user.id),
                fetchIncome(user.id),
                fetchSettings(user.id),
                fetchRecurring(user.id)
            ]);
        } catch (error) {
            console.error('Error checking user:', error);
            router.push('/login');
        }
    };

    const fetchSettings = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (data) {
                setSettings(data);
            } else {
                // Create default settings
                const defaultSettings = {
                    user_id: userId,
                    currency: 'LKR',
                    monthly_budget: 0,
                    regular_savings_goal: 0,
                    regular_savings_current: 0,
                    emergency_goal: 0,
                    emergency_current: 0,
                    investment_goal: 0,
                    investment_current: 0,
                };

                const { data: newSettings, error: insertError } = await supabase
                    .from('user_settings')
                    .insert([defaultSettings])
                    .select()
                    .single();

                if (!insertError) {
                    setSettings(newSettings);
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
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

    const fetchIncome = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('income')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });

            if (error) throw error;
            setIncome(data || []);
        } catch (error) {
            console.error('Error fetching income:', error);
        }
    };

    const fetchRecurring = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('recurring_expenses')
                .select('*')
                .eq('user_id', userId)
                .order('next_date', { ascending: true });

            if (error) throw error;
            setRecurring(data || []);
        } catch (error) {
            console.error('Error fetching recurring:', error);
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

    const handleAddIncome = async (newIncome) => {
        try {
            const { data, error } = await supabase
                .from('income')
                .insert([{
                    user_id: user.id,
                    amount: newIncome.amount,
                    category: newIncome.category,
                    description: newIncome.description,
                    date: newIncome.date,
                }])
                .select();

            if (error) throw error;
            setIncome([data[0], ...income]);
        } catch (error) {
            console.error('Error adding income:', error);
            alert('Failed to add income. Please try again.');
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

    const handleUpdateSavings = async (updates) => {
        try {
            const { error } = await supabase
                .from('user_settings')
                .update(updates)
                .eq('user_id', user.id);

            if (error) throw error;

            // Update local state
            setSettings({ ...settings, ...updates });
        } catch (error) {
            console.error('Error updating savings:', error);
            alert('Failed to update savings.');
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

    // Filter expenses
    const filteredExpenses = expenses.filter((expense) => {
        const categoryMatch = filterCategory === 'All' || expense.category === filterCategory;
        const searchMatch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());

        // Date range filter
        let dateMatch = true;
        if (startDate && endDate) {
            const expenseDate = new Date(expense.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            dateMatch = expenseDate >= start && expenseDate <= end;
        }

        return categoryMatch && searchMatch && dateMatch;
    });

    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const currencySymbol = settings ? CURRENCIES[settings.currency]?.symbol : 'Rs.';

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
                <p className="text-xl text-gray-600 dark:text-gray-300">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Fixed Header - NO GAPS */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 transition-colors">
                <div className="max-w-full mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">💰 Spendly</h1>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Hello, <span className="font-semibold text-gray-800 dark:text-white">
                {user?.user_metadata?.username || 'User'}
              </span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition cursor-pointer"
                            title="Settings"
                        >
                            <SettingsIcon size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 font-semibold cursor-pointer transition-all hover:scale-105 shadow-lg text-sm"
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 3-COLUMN LAYOUT - NO GAPS, FULL WIDTH */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3">

                {/* COLUMN 1 - LEFT */}
                <div className="space-y-3">
                    <AddExpenseForm onAddExpense={handleAddExpense} currencySymbol={currencySymbol} />
                    <IncomeTracker income={income} onAddIncome={handleAddIncome} currencySymbol={currencySymbol} />
                    <RecurringExpenses
                        recurring={recurring}
                        onUpdate={() => fetchRecurring(user.id)}
                        currencySymbol={currencySymbol}
                        userId={user.id}
                    />
                </div>

                {/* COLUMN 2 - MIDDLE (Stats + Budget + Savings) */}
                <div className="space-y-3">
                    <StatsCards expenses={expenses} currencySymbol={currencySymbol} />
                    <BudgetProgress
                        spent={expenses
                            .filter(e => {
                                const expenseDate = new Date(e.date);
                                const now = new Date();
                                return expenseDate.getMonth() === now.getMonth() &&
                                    expenseDate.getFullYear() === now.getFullYear();
                            })
                            .reduce((sum, e) => sum + e.amount, 0)
                        }
                        budget={settings?.monthly_budget || 0}
                        currencySymbol={currencySymbol}
                    />
                    <SavingsCards
                        settings={settings}
                        onUpdate={handleUpdateSavings}
                        currencySymbol={currencySymbol}
                    />
                </div>

                {/* COLUMN 3 - RIGHT (Total + Filters + Expenses List) */}
                <div className="space-y-3">
                    {/* Total Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white p-5 rounded-lg shadow-lg transition-colors">
                        <p className="text-xs opacity-90">Total Expenses</p>
                        <p className="text-3xl font-bold">{currencySymbol}{total.toLocaleString()}</p>
                        <p className="text-xs opacity-75 mt-1">
                            Showing {filteredExpenses.length} of {expenses.length} expenses
                        </p>
                    </div>

                    {/* Date Range Picker */}
                    <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        onStartChange={setStartDate}
                        onEndChange={setEndDate}
                        onQuickSelect={handleDateQuickSelect}
                    />

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Filters</h3>
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

                            {(filterCategory !== 'All' || searchTerm !== '' || startDate !== '' || endDate !== '') && (
                                <button
                                    onClick={() => {
                                        setFilterCategory('All');
                                        setSearchTerm('');
                                        setStartDate('');
                                        setEndDate('');
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
                            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Recent Expenses</h3>
                            {filteredExpenses.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">
                                    {expenses.length === 0
                                        ? 'No expenses yet. Add your first expense!'
                                        : 'No expenses match your filters.'}
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
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

            {/* Settings Modal */}
            {showSettings && (
                <SettingsModal
                    user={user}
                    onClose={() => setShowSettings(false)}
                    onUpdate={() => fetchSettings(user.id)}
                />
            )}
        </div>
    );
}