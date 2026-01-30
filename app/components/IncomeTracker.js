'use client';

import { useState } from 'react';
import { INCOME_CATEGORIES } from '@/lib/currencies';
import { TrendingUp, Plus, X } from 'lucide-react';

export default function IncomeTracker({ income, onAddIncome, currencySymbol }) {
    const [showForm, setShowForm] = useState(false);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Salary');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');

    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);

    const handleSubmit = (e) => {
        e.preventDefault();

        const newIncome = {
            amount: parseFloat(amount),
            category,
            description,
            date,
        };

        onAddIncome(newIncome);

        // Reset form
        setAmount('');
        setCategory('Salary');
        setDescription('');
        setDate('');
        setShowForm(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transition-colors">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="text-green-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Income</h3>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition"
                    title="Add income"
                >
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                </button>
            </div>

            {/* Total Income */}
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-3">
                <p className="text-xs text-green-700 dark:text-green-400">Total Income</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                    {currencySymbol}{totalIncome.toLocaleString()}
                </p>
            </div>

            {/* Add Income Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        placeholder="Amount"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                    />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium cursor-pointer"
                    >
                        {INCOME_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                    />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                    />
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 cursor-pointer transition text-sm"
                    >
                        Add Income
                    </button>
                </form>
            )}

            {/* Recent Income List (Optional - shows last 3) */}
            {income.length > 0 && (
                <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Recent</p>
                    {income.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            <span className="text-gray-700 dark:text-gray-300">{item.category}</span>
                            <span className="font-semibold text-green-700 dark:text-green-400">
                +{currencySymbol}{item.amount.toLocaleString()}
              </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}