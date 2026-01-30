'use client';

export default function StatsCards({ expenses, currencySymbol = 'Rs.' }) {
    // Calculate This Month total
    const thisMonth = expenses
        .filter(expense => {
            const expenseDate = new Date(expense.date);
            const now = new Date();
            return expenseDate.getMonth() === now.getMonth() &&
                expenseDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate Last 7 Days total
    const last7Days = expenses
        .filter(expense => {
            const expenseDate = new Date(expense.date);
            const now = new Date();
            const diffTime = now - expenseDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

    // Find Top Category
    const categoryTotals = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    const topCategory = Object.keys(categoryTotals).length > 0
        ? Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
        : null;

    return (
        <div className="grid grid-cols-3 gap-2">
            {/* This Month Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-3 rounded-lg shadow-lg text-white transition-colors">
                <p className="text-xs opacity-90 mb-1">This Month</p>
                <p className="text-lg font-bold">{currencySymbol}{thisMonth.toLocaleString()}</p>
            </div>

            {/* Last 7 Days Card */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-3 rounded-lg shadow-lg text-white transition-colors">
                <p className="text-xs opacity-90 mb-1">Last 7 Days</p>
                <p className="text-lg font-bold">{currencySymbol}{last7Days.toLocaleString()}</p>
            </div>

            {/* Top Category Card */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 p-3 rounded-lg shadow-lg text-white transition-colors">
                <p className="text-xs opacity-90 mb-1">Top Category</p>
                <p className="text-base font-bold truncate">
                    {topCategory ? topCategory[0] : 'N/A'}
                </p>
            </div>
        </div>
    );
}