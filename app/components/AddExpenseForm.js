'use client';

import { useState } from 'react';

export default function AddExpenseForm({ onAddExpense, currencySymbol = 'Rs.' }) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newExpense = {
            amount: parseFloat(amount),
            category,
            description,
            date,
        };

        await onAddExpense(newExpense);

        setAmount('');
        setCategory('Food');
        setDescription('');
        setDate('');
        setIsSubmitting(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg transition-colors">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Add Expense</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Amount */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Amount ({currencySymbol})
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 font-medium disabled:bg-gray-100 dark:disabled:bg-gray-600 transition-colors text-sm"
                        placeholder="1500"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Category
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 font-medium disabled:bg-gray-100 dark:disabled:bg-gray-600 cursor-pointer transition-colors text-sm"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Description
                    </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 font-medium disabled:bg-gray-100 dark:disabled:bg-gray-600 transition-colors text-sm"
                        placeholder="Coffee with friends"
                    />
                </div>

                {/* Date */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Date
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 font-medium disabled:bg-gray-100 dark:disabled:bg-gray-600 transition-colors text-sm"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-200 cursor-pointer disabled:bg-blue-400 dark:disabled:bg-blue-900 disabled:cursor-not-allowed text-sm"
                >
                    {isSubmitting ? 'Adding...' : 'Add Expense'}
                </button>
            </form>
        </div>
    );
}