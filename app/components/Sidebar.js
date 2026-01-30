'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Receipt,
    TrendingUp,
    Repeat,
    PiggyBank,
    BarChart3,
    Settings,
    LogOut,
    Moon,
    Sun
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function Sidebar({ user }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        setIsDark(theme === 'dark');
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Expenses', icon: Receipt, path: '/dashboard/expenses' },
        { name: 'Income', icon: TrendingUp, path: '/dashboard/income' },
        { name: 'Recurring', icon: Repeat, path: '/dashboard/recurring' },
        { name: 'Savings', icon: PiggyBank, path: '/dashboard/savings' },
        { name: 'Insights', icon: BarChart3, path: '/dashboard/insights' },
    ];

    return (
        <div className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">💰 Spendly</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Hello, <span className="font-semibold text-gray-800 dark:text-white">
            {user?.user_metadata?.username || 'User'}
          </span>
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                                isActive
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <button
                    onClick={() => router.push('/dashboard/settings')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
                >
                    <Settings size={20} />
                    <span className="font-medium">Settings</span>
                </button>

                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    <span className="font-medium">Theme</span>
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>

                {/* Pro Badge (placeholder for future) */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white text-center cursor-pointer hover:scale-105 transition-transform">
                    <p className="text-xs opacity-90">Upgrade to</p>
                    <p className="text-lg font-bold">Pro</p>
                </div>
            </div>
        </div>
    );
}