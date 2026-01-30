'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CURRENCIES } from '@/lib/currencies';
import RecurringExpenses from '../../components/RecurringExpenses';
import { Calendar, AlertCircle, DollarSign } from 'lucide-react';

export default function RecurringPage() {
    const [recurring, setRecurring] = useState([]);
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

            const [recurringData, settingsData] = await Promise.all([
                supabase.from('recurring_expenses').select('*').eq('user_id', user.id).order('next_date', { ascending: true }),
                supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
            ]);

            setRecurring(recurringData.data || []);
            setSettings(settingsData.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const currencySymbol = settings ? CURRENCIES[settings.currency]?.symbol : 'Rs.';

    // Calculate stats
    const activeRecurring = recurring.filter(r => r.is_active);
    const monthlyTotal = activeRecurring
        .filter(r => r.frequency === 'monthly')
        .reduce((sum, r) => sum + r.amount, 0);

    const yearlyTotal = activeRecurring.reduce((sum, r) => {
        if (r.frequency === 'monthly') return sum + (r.amount * 12);
        if (r.frequency === 'weekly') return sum + (r.amount * 52);
        if (r.frequency === 'yearly') return sum + r.amount;
        return sum;
    }, 0);

    // Upcoming this month
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const upcomingThisMonth = activeRecurring.filter(r => {
        const nextDate = new Date(r.next_date);
        return nextDate >= now && nextDate <= endOfMonth;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 dark:text-gray-400">Loading recurring expenses...</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Recurring Expenses</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your subscriptions and recurring bills
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Monthly Commitment */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign size={24} />
                            <p className="text-sm opacity-90">Monthly Total</p>
                        </div>
                        <p className="text-3xl font-bold">{currencySymbol}{monthlyTotal.toLocaleString()}</p>
                        <p className="text-xs opacity-75 mt-2">
                            {activeRecurring.filter(r => r.frequency === 'monthly').length} monthly subscriptions
                        </p>
                    </div>

                    {/* Yearly Projection */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar size={24} />
                            <p className="text-sm opacity-90">Yearly Projection</p>
                        </div>
                        <p className="text-3xl font-bold">{currencySymbol}{yearlyTotal.toLocaleString()}</p>
                        <p className="text-xs opacity-75 mt-2">All recurring expenses</p>
                    </div>

                    {/* Upcoming This Month */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle size={24} />
                            <p className="text-sm opacity-90">Due This Month</p>
                        </div>
                        <p className="text-3xl font-bold">{upcomingThisMonth.length}</p>
                        <p className="text-xs opacity-75 mt-2">
                            {currencySymbol}{upcomingThisMonth.reduce((sum, r) => sum + r.amount, 0).toLocaleString()} total
                        </p>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left - Add Form */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <RecurringExpenses
                                recurring={recurring}
                                onUpdate={loadData}
                                currencySymbol={currencySymbol}
                                userId={userId}
                            />
                        </div>
                    </div>

                    {/* Right - Lists */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Upcoming Bills */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                Upcoming Bills
                            </h2>

                            {upcomingThisMonth.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                    No bills due this month
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingThisMonth.map((item) => {
                                        const daysUntil = Math.ceil((new Date(item.next_date) - now) / (1000 * 60 * 60 * 24));

                                        return (
                                            <div
                                                key={item.id}
                                                className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500"
                                            >
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-white">
                                                        {item.description || item.category}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Due: {item.next_date} • {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                                                    </p>
                                                </div>
                                                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                                    {currencySymbol}{item.amount.toLocaleString()}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Active Recurring */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                Active Recurring ({activeRecurring.length})
                            </h2>

                            {activeRecurring.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                    No active recurring expenses
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {activeRecurring.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800 dark:text-white">
                                                    {item.description || item.category}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)} • Next: {item.next_date}
                                                </p>
                                            </div>
                                            <p className="text-lg font-bold text-gray-800 dark:text-white mr-4">
                                                {currencySymbol}{item.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Paused/Inactive */}
                        {recurring.filter(r => !r.is_active).length > 0 && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                    Paused ({recurring.filter(r => !r.is_active).length})
                                </h2>

                                <div className="space-y-3">
                                    {recurring.filter(r => !r.is_active).map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg opacity-60"
                                        >
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800 dark:text-white">
                                                    {item.description || item.category}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Paused • Was {item.frequency}
                                                </p>
                                            </div>
                                            <p className="text-lg font-bold text-gray-600 dark:text-gray-400 mr-4">
                                                {currencySymbol}{item.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Info Box */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="flex gap-3">
                                <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} />
                                <div>
                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                                        Automatic Processing
                                    </p>
                                    <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                                        Recurring expenses are automatically added to your expenses when they are due.
                                        Check your email for notifications.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}