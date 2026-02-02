import { NextResponse } from 'next/server';
import { getHistory, HistoryEntry } from '@/lib/db';

export async function GET() {
    try {
        const history = getHistory();
        
        // 1. Calculate KPI Stats
        const totalGenerated = history.length;
        const totalSent = history.filter(h => h.status === 'Sent').length;
        
        // Calculate Streak (Simplified: consecutive days with at least one entry)
        let streak = 0;
        const today = new Date().toDateString();
        // This is a naive streak calc for demo purposes
        const dates = new Set(history.map(h => new Date(h.date).toDateString()));
        // ... (Proper streak logic would check yeseterday, day before, etc.)
        if (dates.size > 0) streak = dates.size; // Just count active days for now

        // 2. Prepare Chart Data (Last 7 Days)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartDataMap = new Map<string, { resumes: number, applications: number }>();
        
        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = days[d.getDay()];
            chartDataMap.set(dayName, { resumes: 0, applications: 0 });
        }

        // Fill with actual data
        history.forEach(entry => {
            const entryDate = new Date(entry.date);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - entryDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 7) {
                const dayName = days[entryDate.getDay()];
                if (chartDataMap.has(dayName)) {
                    const val = chartDataMap.get(dayName)!;
                    val.resumes += 1;
                    if (entry.status === 'Sent') val.applications += 1;
                }
            }
        });

        const activityData = Array.from(chartDataMap.entries()).map(([name, data]) => ({
            name,
            resumes: data.resumes,
            applications: data.applications
        }));

        // 3. Format Recent History
        const recentHistory = history.slice(0, 10).map(h => ({
            id: h.id,
            title: h.jobTitle || 'Untitled Position',
            company: h.company || 'Unknown Company',
            date: new Date(h.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            status: h.status
        }));

        return NextResponse.json({
            stats: {
                totalGenerated,
                totalSent,
                streak
            },
            activityData,
            recentHistory
        });

    } catch (error) {
        console.error("History API Error:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
