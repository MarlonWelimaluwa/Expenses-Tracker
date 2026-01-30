'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CURRENCIES } from '@/lib/currencies';
import { Settings as SettingsIcon, User, DollarSign, Target, AlertTriangle, Download } from 'lucide-react';

export default function SettingsPage() {
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Form states
    const [username, setUsername] = useState('');
    const [currency, setCurrency] = useState('LKR');
    const [monthlyBudget, setMonthlyBudget] = useState('');
    const [regularSavingsGoal, setRegularSavingsGoal] = useState('');
    const [emergencyGoal, setEmergencyGoal] = useState('');
    const [investmentGoal, setInvestmentGoal] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUser(user);
            setUsername(user.user_metadata?.username || '');

            const { data: settingsData } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (settingsData) {
                setSettings(settingsData);
                setCurrency(settingsData.currency || 'LKR');
                setMonthlyBudget(settingsData.monthly_budget || '');
                setRegularSavingsGoal(settingsData.regular_savings_goal || '');
                setEmergencyGoal(settingsData.emergency_goal || '');
                setInvestmentGoal(settingsData.investment_goal || '');
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        setMessage('');

        try {
            // Update username
            const { error: userError } = await supabase.auth.updateUser({
                data: { username: username }
            });

            if (userError) throw userError;

            // Update settings
            const { error: settingsError } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    currency,
                    monthly_budget: parseFloat(monthlyBudget) || 0,
                    regular_savings_goal: parseFloat(regularSavingsGoal) || 0,
                    emergency_goal: parseFloat(emergencyGoal) || 0,
                    investment_goal: parseFloat(investmentGoal) || 0,
                }, { onConflict: 'user_id' });

            if (settingsError) throw settingsError;

            setMessage('Settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleExportAllData = async () => {
        try {
            const [expenses, income, recurring] = await Promise.all([
                supabase.from('expenses').select('*').eq('user_id', user.id),
                supabase.from('income').select('*').eq('user_id', user.id),
                supabase.from('recurring_expenses').select('*').eq('user_id', user.id),
            ]);

            const data = {
                expenses: expenses.data,
                income: income.data,
                recurring: recurring.data,
                settings: settings,
                exported_at: new Date().toISOString(),
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `spendly-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Failed to export data');
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = confirm(
            'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
        );

        if (!confirmed) return;

        const doubleConfirm = prompt('Type "DELETE" to confirm account deletion:');
        if (doubleConfirm !== 'DELETE') {
            alert('Account deletion cancelled');
            return;
        }

        try {
            // Delete all user data
            await Promise.all([
                supabase.from('expenses').delete().eq('user_id', user.id),
                supabase.from('income').delete().eq('user_id', user.id),
                supabase.from('recurring_expenses').delete().eq('user_id', user.id),
                supabase.from('user_settings').delete().eq('user_id', user.id),
            ]);

            // Sign out (Supabase doesn't allow account deletion from client)
            await supabase.auth.signOut();
            window.location.href = '/login';
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Failed to delete account');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your account and preferences
                    </p>
                </div>

                {/* Account Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                    <div className="flex items-center gap-2 mb-6">
                        <User className="text-blue-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Account</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Email cannot be changed
                            </p>
                        </div>
                    </div>
                </div>

                {/* Currency Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                    <div className="flex items-center gap-2 mb-6">
                        <DollarSign className="text-green-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Currency</h2>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Default Currency
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
                </div>

                {/* Budget & Goals */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                    <div className="flex items-center gap-2 mb-6">
                        <Target className="text-purple-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Budget & Goals</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Monthly Budget Limit
                            </label>
                            <input
                                type="number"
                                value={monthlyBudget}
                                onChange={(e) => setMonthlyBudget(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                                placeholder="50000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Regular Savings Goal
                            </label>
                            <input
                                type="number"
                                value={regularSavingsGoal}
                                onChange={(e) => setRegularSavingsGoal(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                                placeholder="100000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Emergency Fund Goal
                            </label>
                            <input
                                type="number"
                                value={emergencyGoal}
                                onChange={(e) => setEmergencyGoal(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                                placeholder="200000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Investment Goal
                            </label>
                            <input
                                type="number"
                                value={investmentGoal}
                                onChange={(e) => setInvestmentGoal(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                                placeholder="500000"
                            />
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`p-4 rounded-lg ${
                        message.includes('success')
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                        {message}
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg cursor-pointer transition-all hover:scale-[1.02] disabled:bg-blue-400 disabled:cursor-not-allowed shadow-lg"
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>

                {/* Data Management */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                    <div className="flex items-center gap-2 mb-6">
                        <Download className="text-orange-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Data Management</h2>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleExportAllData}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold cursor-pointer transition"
                        >
                            <Download size={20} />
                            Export All Data (JSON)
                        </button>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Download all your expenses, income, and settings as a JSON file
                        </p>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border-2 border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="text-red-600" size={24} />
                        <h2 className="text-xl font-bold text-red-800 dark:text-red-400">Danger Zone</h2>
                    </div>

                    <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                        Once you delete your account, there is no going back. All your data will be permanently deleted.
                    </p>

                    <button
                        onClick={handleDeleteAccount}
                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold cursor-pointer transition"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}