'use client';

import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function BudgetProgress({ spent, budget, currencySymbol }) {
    if (!budget || budget === 0) {
        return (
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Set a monthly budget in settings to track your spending
                </p>
            </div>
        );
    }

    const percentage = Math.min(100, (spent / budget) * 100);
    const remaining = budget - spent;

    let status = 'good';
    let message = "You're doing great! 💚";
    let icon = <CheckCircle className="text-green-600" size={20} />;
    let barColor = 'bg-green-500';
    let bgColor = 'bg-green-50 dark:bg-green-900/20';
    let textColor = 'text-green-800 dark:text-green-300';

    if (percentage >= 90) {
        status = 'danger';
        message = remaining >= 0 ? "CLOSE TO LIMIT! ⚠️" : "OVER BUDGET! 🚨";
        icon = <XCircle className="text-red-600" size={20} />;
        barColor = 'bg-red-500';
        bgColor = 'bg-red-50 dark:bg-red-900/20';
        textColor = 'text-red-800 dark:text-red-300';
    } else if (percentage >= 70) {
        status = 'warning';
        message = "Getting close! ⚠️";
        icon = <AlertTriangle className="text-yellow-600" size={20} />;
        barColor = 'bg-yellow-500';
        bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
        textColor = 'text-yellow-800 dark:text-yellow-300';
    }

    return (
        <div className={`${bgColor} p-4 rounded-lg shadow transition-colors`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Monthly Budget</h3>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3 mb-2">
                <div
                    className={`${barColor} rounded-full h-3 transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            {/* Stats */}
            <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-700 dark:text-gray-300">
          {currencySymbol}{spent.toLocaleString()} of {currencySymbol}{budget.toLocaleString()}
        </span>
                <span className="font-semibold text-gray-800 dark:text-white">
          {percentage.toFixed(0)}%
        </span>
            </div>

            {/* Message */}
            <p className={`text-xs font-semibold ${textColor}`}>
                {message}
            </p>

            {remaining < 0 ? (
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                    Over by {currencySymbol}{Math.abs(remaining).toLocaleString()}
                </p>
            ) : (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {currencySymbol}{remaining.toLocaleString()} remaining
                </p>
            )}
        </div>
    );
}