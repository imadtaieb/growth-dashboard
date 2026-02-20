import { NextRequest, NextResponse } from 'next/server';
import { getAllMetrics, createMetric } from '@/lib/storage';
import { calculateDashboardStats } from '@/lib/calculations';

export async function GET() {
  try {
    const metrics = await getAllMetrics();
    const stats = calculateDashboardStats(metrics);

    return NextResponse.json({
      metrics,
      stats,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weekStartDate, weekEndDate, websiteVisitors, waitlistSignups } = body;

    // Validation
    if (!weekStartDate || !weekEndDate) {
      return NextResponse.json(
        { error: 'Week start and end dates are required' },
        { status: 400 }
      );
    }

    if (websiteVisitors === undefined || waitlistSignups === undefined) {
      return NextResponse.json(
        { error: 'Website visitors and waitlist signups are required' },
        { status: 400 }
      );
    }

    const visitors = Number(websiteVisitors);
    const signups = Number(waitlistSignups);

    if (isNaN(visitors) || isNaN(signups) || visitors < 0 || signups < 0) {
      return NextResponse.json(
        { error: 'Invalid numbers for visitors or signups' },
        { status: 400 }
      );
    }

    // Calculate conversion rate
    const conversionRate = visitors === 0 ? 0 : (signups / visitors) * 100;

    const newMetric = await createMetric({
      weekStartDate,
      weekEndDate,
      websiteVisitors: visitors,
      waitlistSignups: signups,
      conversionRate: Number(conversionRate.toFixed(2)),
    });

    return NextResponse.json(newMetric, { status: 201 });
  } catch (error) {
    console.error('Error creating metric:', error);
    return NextResponse.json(
      { error: 'Failed to create metric' },
      { status: 500 }
    );
  }
}
