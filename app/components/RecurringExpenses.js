'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Repeat, Plus, X, Trash2, Edit, Pause, Play } from 'lucide-react';

export default function RecurringExpenses({ recurring, onUpdate, currencySymbol, userId }) {
    const [showForm, setShowForm] = useState(false);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Bills');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('monthly');
    const [startDate, setStartDate] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = ['Bills', 'Subscriptions', 'Rent', 'Insurance', 'Other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const nextDate = calculateNextDate(startDate, frequency);

            const { data, error } = await supabase
                .from('recurring_expenses')
                .insert([{
                    user_id: userId,
                    amount: parseFloat(amount),
                    category,
                    description,
                    frequency,
                    start_date: startDate,
                    next_date: nextDate,
                    is_active: true,
                }])
                .select();

            if (error) throw error;

            setAmount('');
            setCategory('Bills');
            setDescription('');
            setFrequency('monthly');
            setStartDate('');
            setShowForm(false);
            onUpdate();
        } catch (error) {
            console.error('Error adding recurring expense:', error);
            alert('Failed to add recurring expense');
        } finally {
            setLoading(false);
        }
    };

    const calculateNextDate = (date, freq) => {
        const d = new Date(date);
        if (freq === 'monthly') {
            d.setMonth(d.getMonth() + 1);
        } else if (freq === 'weekly') {
            d.setDate(d.getDate() + 7);
        } else if (freq === 'yearly') {
            d.setFullYear(d.getFullYear() + 1);
        }
        return d.toISOString().split('T')[0];
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('recurring_expenses')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            onUpdate();
        } catch (error) {
            console.error('Error toggling recurring expense:', error);
        }
    };

    const deleteRecurring = async (id) => {
        if (!confirm('Delete this recurring expense?')) return;

        try {
            const { error } = await supabase
                .from('recurring_expenses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            onUpdate();
        } catch (error) {
            console.error('Error deleting recurring expense:', error);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transition-colors">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <Repeat className="text-purple-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recurring</h3>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition"
                    title="Add recurring expense"
                >
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        placeholder="Amount"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                    />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium cursor-pointer"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                    />
                    <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium cursor-pointer"
                    >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 cursor-pointer transition text-sm disabled:bg-purple-400"
                    >
                        {loading ? 'Adding...' : 'Add Recurring'}
                    </button>
                </form>
            )}

            {/* List */}
            <div className="space-y-2">
                {recurring.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                        No recurring expenses yet
                    </p>
                ) : (
                    recurring.map((item) => (
                        <div
                            key={item.id}
                            className={`flex justify-between items-center p-3 rounded-lg ${
                                item.is_active
                                    ? 'bg-purple-50 dark:bg-purple-900/20'
                                    : 'bg-gray-100 dark:bg-gray-700 opacity-60'
                            }`}
                        >
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-800 dark:text-white">
                                    {item.description || item.category}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {currencySymbol}{item.amount} • {item.frequency}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    Next: {item.next_date}
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => toggleActive(item.id, item.is_active)}
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-pointer transition"
                                    title={item.is_active ? 'Pause' : 'Resume'}
                                >
                                    {item.is_active ? (
                                        <Pause size={14} className="text-gray-600 dark:text-gray-300" />
                                    ) : (
                                        <Play size={14} className="text-gray-600 dark:text-gray-300" />
                                    )}
                                </button>
                                <button
                                    onClick={() => deleteRecurring(item.id)}
                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded cursor-pointer transition"
                                    title="Delete"
                                >
                                    <Trash2 size={14} className="text-red-600" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}