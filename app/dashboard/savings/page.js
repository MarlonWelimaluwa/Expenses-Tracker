'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CURRENCIES } from '@/lib/currencies';
import SavingsCards from '../../components/SavingsCards';
import { Target, TrendingUp, Calendar } from 'lucide-react';

export default function SavingsPage() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserId(user.id);

            const { data: settingsData } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            setSettings(settingsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSavings = async (updates) => {
        try {
            const { error } = await supabase
                .from('user_settings')
                .update(updates)
                .eq('user_id', userId);

            if (error) throw error;
            setSettings({ ...settings, ...updates });
        } catch (error) {
            console.error('Error updating savings:', error);
            alert('Failed to update savings');
        }
    };

    const currencySymbol = settings ? CURRENCIES[settings.currency]?.symbol : 'Rs.';

    // Calculate overall progress
    const totalGoal = (settings?.regular_savings_goal || 0) +
        (settings?.emergency_goal || 0) +
        (settings?.investment_goal || 0);

    const totalSaved = (settings?.regular_savings_current || 0) +
        (settings?.emergency_current || 0) +
        (settings?.investment_current || 0);

    const overallPercentage = totalGoal > 0 ? (totalSaved / totalGoal) * 100 : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 dark:text-gray-400">Loading savings...</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Savings & Goals</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Track your progress toward financial goals
                    </p>
                </div>

                {/* Overall Progress */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 p-8 rounded-xl shadow-lg text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <Target size={32} />
                        <div>
                            <p className="text-lg opacity-90">Overall Savings Progress</p>
                            <p className="text-4xl font-bold mt-1">
                                {currencySymbol}{totalSaved.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="w-full bg-white bg-opacity-20 rounded-full h-4 mb-2">
                        <div
                            className="bg-white rounded-full h-4 transition-all duration-500"
                            style={{ width: `${Math.min(100, overallPercentage)}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span>Goal: {currencySymbol}{totalGoal.toLocaleString()}</span>
                        <span>{overallPercentage.toFixed(1)}% Complete</span>
                    </div>
                </div>

                {/* Savings Cards */}
                <SavingsCards
                    settings={settings}
                    onUpdate={handleUpdateSavings}
                    currencySymbol={currencySymbol}
                />

                {/* Tips & Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Savings Calculator */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="text-blue-600" size={24} />
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                Savings Calculator
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {settings?.regular_savings_goal > 0 && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Regular Savings Goal
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        To reach {currencySymbol}{settings.regular_savings_goal.toLocaleString()} in 12 months:
                                    </p>
                                    <p className="text-lg font-bold text-green-700 dark:text-green-400 mt-2">
                                        Save {currencySymbol}
                                        {Math.ceil((settings.regular_savings_goal - settings.regular_savings_current) / 12).toLocaleString()}
                                        /month
                                    </p>
                                </div>
                            )}

                            {settings?.emergency_goal > 0 && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Emergency Fund Goal
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        To reach {currencySymbol}{settings.emergency_goal.toLocaleString()} in 12 months:
                                    </p>
                                    <p className="text-lg font-bold text-red-700 dark:text-red-400 mt-2">
                                        Save {currencySymbol}
                                        {Math.ceil((settings.emergency_goal - settings.emergency_current) / 12).toLocaleString()}
                                        /month
                                    </p>
                                </div>
                            )}

                            {settings?.investment_goal > 0 && (
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Investment Goal
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        To reach {currencySymbol}{settings.investment_goal.toLocaleString()} in 12 months:
                                    </p>
                                    <p className="text-lg font-bold text-purple-700 dark:text-purple-400 mt-2">
                                        Save {currencySymbol}
                                        {Math.ceil((settings.investment_goal - settings.investment_current) / 12).toLocaleString()}
                                        /month
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="text-green-600" size={24} />
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                Savings Tips
                            </h2>
                        </div>

                        <ul className="space-y-3">
                            <li className="flex gap-3">
                                <span className="text-green-600 text-xl">💡</span>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white text-sm">
                                        Automate Your Savings
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Set up automatic transfers on payday to savings accounts
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-green-600 text-xl">🎯</span>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white text-sm">
                                        Emergency Fund First
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Aim for 3-6 months of expenses in emergency fund
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-green-600 text-xl">📊</span>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white text-sm">
                                        Track Progress Weekly
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Regular check-ins keep you motivated
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-green-600 text-xl">🚀</span>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white text-sm">
                                        Invest Wisely
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Consider low-cost index funds for long-term growth
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}