'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CURRENCIES } from '@/lib/currencies';
import IncomeTracker from '../../components/IncomeTracker';
import { Download, TrendingUp } from 'lucide-react';

export default function IncomePage() {
    const [income, setIncome] = useState([]);
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

            const [incomeData, settingsData] = await Promise.all([
                supabase.from('income').select('*').eq('user_id', user.id).order('date', { ascending: false }),
                supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
            ]);

            setIncome(incomeData.data || []);
            setSettings(settingsData.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddIncome = async (newIncome) => {
        try {
            const { data, error } = await supabase
                .from('income')
                .insert([{
                    user_id: userId,
                    amount: newIncome.amount,
                    category: newIncome.category,
                    description: newIncome.description,
                    date: newIncome.date,
                }])
                .select();

            if (error) throw error;
            setIncome([data[0], ...income]);
        } catch (error) {
            console.error('Error adding income:', error);
            alert('Failed to add income');
        }
    };

    const handleDeleteIncome = async (id) => {
        if (!confirm('Delete this income entry?')) return;

        try {
            const { error } = await supabase
                .from('income')
                .delete()
                .eq('id', id)
                .eq('user_id', userId);

            if (error) throw error;
            setIncome(income.filter((i) => i.id !== id));
        } catch (error) {
            console.error('Error deleting income:', error);
        }
    };

    const handleExportCSV = () => {
        const csvData = income.map(i =>
            `${i.date},${i.category},${i.description},${i.amount}`
        ).join('\n');

        const csv = `Date,Category,Description,Amount\n${csvData}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `income-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const total = income.reduce((sum, i) => sum + i.amount, 0);
    const currencySymbol = settings ? CURRENCIES[settings.currency]?.symbol : 'Rs.';

    // Group by category
    const byCategory = income.reduce((acc, i) => {
        acc[i.category] = (acc[i.category] || 0) + i.amount;
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 dark:text-gray-400">Loading income...</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Income</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Track all your income sources
                        </p>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold cursor-pointer transition"
                    >
                        <Download size={20} />
                        Export CSV
                    </button>
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-8 rounded-xl shadow-lg text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp size={32} />
                        <p className="text-lg opacity-90">Total Income</p>
                    </div>
                    <p className="text-5xl font-bold">{currencySymbol}{total.toLocaleString()}</p>
                    <p className="text-sm opacity-75 mt-2">{income.length} entries</p>
                </div>

                {/* Two Column */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left - Add Form */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <IncomeTracker
                                income={income}
                                onAddIncome={handleAddIncome}
                                currencySymbol={currencySymbol}
                            />
                        </div>
                    </div>

                    {/* Right - List & Breakdown */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Category Breakdown */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                By Category
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(byCategory).map(([category, amount]) => (
                                    <div key={category} className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{category}</p>
                                        <p className="text-xl font-bold text-green-700 dark:text-green-400">
                                            {currencySymbol}{amount.toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Income List */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                All Income
                            </h2>

                            {income.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No income entries yet. Add your first income!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {income.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-white">
                                                    {item.category}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {item.description} • {item.date}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                                    +{currencySymbol}{item.amount.toLocaleString()}
                                                </p>
                                                <button
                                                    onClick={() => handleDeleteIncome(item.id)}
                                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 cursor-pointer transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}