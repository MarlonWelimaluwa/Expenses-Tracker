'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function CategoryChart({ expenses }) {
    // Group expenses by category and calculate totals
    const categoryData = expenses.reduce((acc, expense) => {
        const existing = acc.find(item => item.name === expense.category);
        if (existing) {
            existing.value += expense.amount;
        } else {
            acc.push({ name: expense.category, value: expense.amount });
        }
        return acc;
    }, []);

    // Sort by value (highest first)
    categoryData.sort((a, b) => b.value - a.value);

    // Colors for each category
    const COLORS = [
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Orange
        '#EF4444', // Red
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#06B6D4', // Cyan
        '#F97316', // Orange
    ];

    // Custom label to show percentage
    const renderLabel = (entry) => {
        const total = categoryData.reduce((sum, item) => sum + item.value, 0);
        const percent = ((entry.value / total) * 100).toFixed(1);
        return `${percent}%`;
    };

    if (categoryData.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                    Category Breakdown
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">
                    No data yet. Add expenses to see breakdown.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Category Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={renderLabel}
                        labelLine={false}
                    >
                        {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => `Rs. ${value.toLocaleString()}`}
                        contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white'
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry) => (
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                {value}
              </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}