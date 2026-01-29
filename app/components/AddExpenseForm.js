'use client';

import { useState } from 'react';

export default function AddExpenseForm({ onAddExpense }) {
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full transition-colors">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Add New Expense</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Amount (Rs.)
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 font-medium disabled:bg-gray-100 dark:disabled:bg-gray-600 transition-colors"
                        placeholder="1500"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Category
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 font-medium disabled:bg-gray-100 dark:disabled:bg-gray-600 cursor-pointer transition-colors"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Description
                    </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 font-medium disabled:bg-gray-100 dark:disabled:bg-gray-600 transition-colors"
                        placeholder="Coffee with friends"
                    />
                </div>

                {/* Date */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Date
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 font-medium disabled:bg-gray-100 dark:disabled:bg-gray-600 transition-colors"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-200 cursor-pointer disabled:bg-blue-400 dark:disabled:bg-blue-900 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Adding...' : 'Add Expense'}
                </button>
            </form>
        </div>
    );
}