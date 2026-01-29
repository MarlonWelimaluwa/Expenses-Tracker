'use client';

import { useState } from 'react';

export default function ExpenseItem({ expense, onDelete, onEdit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editAmount, setEditAmount] = useState(expense.amount);
    const [editCategory, setEditCategory] = useState(expense.category);
    const [editDescription, setEditDescription] = useState(expense.description);
    const [editDate, setEditDate] = useState(expense.date);

    const categories = ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Other'];

    const handleSave = () => {
        const updatedExpense = {
            ...expense,
            amount: parseFloat(editAmount),
            category: editCategory,
            description: editDescription,
            date: editDate,
        };
        onEdit(updatedExpense);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditAmount(expense.amount);
        setEditCategory(expense.category);
        setEditDescription(expense.description);
        setEditDate(expense.date);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-2 border-blue-300 dark:border-blue-700 transition-colors">
                <div className="space-y-3">
                    <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 font-medium transition-colors"
                        placeholder="Amount"
                    />
                    <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 font-medium cursor-pointer transition-colors"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 font-medium transition-colors"
                        placeholder="Description"
                    />
                    <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 font-medium transition-colors"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-green-600 dark:bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-800 cursor-pointer transition-colors"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex-1 bg-gray-400 dark:bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-500 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
            <div>
                <p className="font-semibold text-gray-800 dark:text-white">{expense.category}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{expense.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{expense.date}</p>
            </div>
            <div className="flex items-center gap-4">
                <p className="text-lg font-bold text-gray-800 dark:text-white">Rs. {expense.amount}</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white text-sm rounded hover:bg-blue-700 dark:hover:bg-blue-800 cursor-pointer transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(expense.id)}
                        className="px-3 py-1 bg-red-600 dark:bg-red-700 text-white text-sm rounded hover:bg-red-700 dark:hover:bg-red-800 cursor-pointer transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}