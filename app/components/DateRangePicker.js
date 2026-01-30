'use client';

import { Calendar } from 'lucide-react';

export default function DateRangePicker({ startDate, endDate, onStartChange, onEndChange, onQuickSelect }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors">
            <div className="flex items-center gap-2 mb-3">
                <Calendar className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Date Range</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        From
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        To
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
                    />
                </div>
            </div>

            {/* Quick Select Buttons */}
            <div className="grid grid-cols-3 gap-2">
                <button
                    onClick={() => onQuickSelect('thisMonth')}
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer transition"
                >
                    This Month
                </button>
                <button
                    onClick={() => onQuickSelect('last30')}
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer transition"
                >
                    Last 30 Days
                </button>
                <button
                    onClick={() => onQuickSelect('all')}
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer transition"
                >
                    All Time
                </button>
            </div>
        </div>
    );
}