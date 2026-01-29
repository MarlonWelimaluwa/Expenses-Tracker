'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export default function ExpenseItem({ expense, onDelete, onEdit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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

    const handleDeleteClick = () => {
        setIsDeleting(true);
    };

    const confirmDelete = () => {
        onDelete(expense.id);
        setIsDeleting(false);
    };

    const cancelDelete = () => {
        setIsDeleting(false);
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
        <>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white">{expense.category}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{expense.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{expense.date}</p>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-gray-800 dark:text-white mr-2">Rs. {expense.amount.toLocaleString()}</p>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 cursor-pointer transition-all hover:scale-110"
                        title="Edit expense"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="p-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 cursor-pointer transition-all hover:scale-110"
                        title="Delete expense"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleting && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                            Delete Expense?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete this expense? This action cannot be undone.
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Amount: <span className="font-semibold text-gray-800 dark:text-white">Rs. {expense.amount}</span></p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Category: <span className="font-semibold text-gray-800 dark:text-white">{expense.category}</span></p>
                            {expense.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">Description: <span className="font-semibold text-gray-800 dark:text-white">{expense.description}</span></p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelDelete}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold cursor-pointer transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}