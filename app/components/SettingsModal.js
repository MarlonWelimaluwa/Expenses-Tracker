'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CURRENCIES } from '@/lib/currencies';
import { X, Settings } from 'lucide-react';

export default function SettingsModal({ user, onClose, onUpdate }) {
    const [currency, setCurrency] = useState('LKR');
    const [monthlyBudget, setMonthlyBudget] = useState('');
    const [regularSavingsGoal, setRegularSavingsGoal] = useState('');
    const [emergencyGoal, setEmergencyGoal] = useState('');
    const [investmentGoal, setInvestmentGoal] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setCurrency(data.currency || 'LKR');
                setMonthlyBudget(data.monthly_budget || '');
                setRegularSavingsGoal(data.regular_savings_goal || '');
                setEmergencyGoal(data.emergency_goal || '');
                setInvestmentGoal(data.investment_goal || '');
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage('');

        try {
            const settings = {
                user_id: user.id,
                currency,
                monthly_budget: parseFloat(monthlyBudget) || 0,
                regular_savings_goal: parseFloat(regularSavingsGoal) || 0,
                emergency_goal: parseFloat(emergencyGoal) || 0,
                investment_goal: parseFloat(investmentGoal) || 0,
            };

            const { error } = await supabase
                .from('user_settings')
                .upsert(settings, { onConflict: 'user_id' });

            if (error) throw error;

            setMessage('Settings saved successfully!');
            onUpdate();
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Settings className="text-blue-600" size={24} />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Currency */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Currency
                        </label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium cursor-pointer"
                        >
                            {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
                                <option key={code} value={code}>
                                    {symbol} - {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Monthly Budget */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Monthly Budget Limit
                        </label>
                        <input
                            type="number"
                            value={monthlyBudget}
                            onChange={(e) => setMonthlyBudget(e.target.value)}
                            placeholder="10000"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                        />
                    </div>

                    {/* Savings Goals */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Savings Goals
                        </h3>

                        <div className="space-y-4">
                            {/* Regular Savings */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Regular Savings Goal
                                </label>
                                <input
                                    type="number"
                                    value={regularSavingsGoal}
                                    onChange={(e) => setRegularSavingsGoal(e.target.value)}
                                    placeholder="50000"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                                />
                            </div>

                            {/* Emergency Fund */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Emergency Fund Goal
                                </label>
                                <input
                                    type="number"
                                    value={emergencyGoal}
                                    onChange={(e) => setEmergencyGoal(e.target.value)}
                                    placeholder="100000"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                                />
                            </div>

                            {/* Investments */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Investment Goal
                                </label>
                                <input
                                    type="number"
                                    value={investmentGoal}
                                    onChange={(e) => setInvestmentGoal(e.target.value)}
                                    placeholder="200000"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${
                            message.includes('success')
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                            {message}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer disabled:bg-blue-400"
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}