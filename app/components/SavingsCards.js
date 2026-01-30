'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function SavingsCards({ settings, onUpdate, currencySymbol }) {
    const [showAddModal, setShowAddModal] = useState(null);
    const [amount, setAmount] = useState('');

    const savings = [
        {
            id: 'regular',
            name: 'Regular Savings',
            current: settings?.regular_savings_current || 0,
            goal: settings?.regular_savings_goal || 0,
            color: 'from-green-500 to-green-600',
            darkColor: 'from-green-600 to-green-700',
            emoji: '💰'
        },
        {
            id: 'emergency',
            name: 'Emergency Fund',
            current: settings?.emergency_current || 0,
            goal: settings?.emergency_goal || 0,
            color: 'from-red-500 to-red-600',
            darkColor: 'from-red-600 to-red-700',
            emoji: '🚨'
        },
        {
            id: 'investment',
            name: 'Investments',
            current: settings?.investment_current || 0,
            goal: settings?.investment_goal || 0,
            color: 'from-purple-500 to-purple-600',
            darkColor: 'from-purple-600 to-purple-700',
            emoji: '📈'
        }
    ];

    const handleAddMoney = (type, isAdding) => {
        const value = parseFloat(amount);
        if (!value || value <= 0) return;

        const updates = {};
        if (type === 'regular') {
            updates.regular_savings_current = isAdding
                ? (settings.regular_savings_current || 0) + value
                : Math.max(0, (settings.regular_savings_current || 0) - value);
        } else if (type === 'emergency') {
            updates.emergency_current = isAdding
                ? (settings.emergency_current || 0) + value
                : Math.max(0, (settings.emergency_current || 0) - value);
        } else if (type === 'investment') {
            updates.investment_current = isAdding
                ? (settings.investment_current || 0) + value
                : Math.max(0, (settings.investment_current || 0) - value);
        }

        onUpdate(updates);
        setAmount('');
        setShowAddModal(null);
    };

    return (
        <div className="space-y-3">
            {savings.map((saving) => {
                const percentage = saving.goal > 0 ? Math.min(100, (saving.current / saving.goal) * 100) : 0;

                return (
                    <div key={saving.id} className={`bg-gradient-to-r ${saving.color} dark:${saving.darkColor} p-4 rounded-lg shadow-lg text-white transition-colors`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-xs opacity-90">{saving.emoji} {saving.name}</p>
                                <p className="text-2xl font-bold">{currencySymbol}{saving.current.toLocaleString()}</p>
                                <p className="text-xs opacity-75">of {currencySymbol}{saving.goal.toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(saving.id)}
                                className="p-2 bg-white bg-opacity-25 hover:bg-opacity-35 rounded-lg transition cursor-pointer shadow-sm border border-white border-opacity-30"
                                title="Add/Remove money"
                            >
                                <Plus size={18} className="text-green-600 drop-shadow-md" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
                            <div
                                className="bg-white rounded-full h-2 transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-right mt-1 opacity-90">{percentage.toFixed(0)}%</p>
                    </div>
                );
            })}

            {/* Add/Remove Money Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                            Update {savings.find(s => s.id === showAddModal)?.name}
                        </h3>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                            autoFocus
                        />
                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={() => handleAddMoney(showAddModal, true)}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 cursor-pointer font-semibold transition"
                            >
                                <Plus size={18} /> Add
                            </button>
                            <button
                                onClick={() => handleAddMoney(showAddModal, false)}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 cursor-pointer font-semibold transition"
                            >
                                <Minus size={18} /> Remove
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setShowAddModal(null);
                                setAmount('');
                            }}
                            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer font-semibold transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}