import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request) {
    // Verify cron secret (security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const today = new Date().toISOString().split('T')[0];

    try {
        const { data: dueRecurring } = await supabase
            .from('recurring_expenses')
            .select('*')
            .eq('is_active', true)
            .lte('next_date', today);

        for (const recurring of dueRecurring || []) {
            await supabase.from('expenses').insert([{
                user_id: recurring.user_id,
                amount: recurring.amount,
                category: recurring.category,
                description: `${recurring.description} (Auto)`,
                date: recurring.next_date,
            }]);

            let nextDate = new Date(recurring.next_date);
            if (recurring.frequency === 'monthly') {
                nextDate.setMonth(nextDate.getMonth() + 1);
            } else if (recurring.frequency === 'weekly') {
                nextDate.setDate(nextDate.getDate() + 7);
            } else if (recurring.frequency === 'yearly') {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
            }

            await supabase
                .from('recurring_expenses')
                .update({ next_date: nextDate.toISOString().split('T')[0] })
                .eq('id', recurring.id);
        }

        return NextResponse.json({ processed: dueRecurring?.length || 0 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}