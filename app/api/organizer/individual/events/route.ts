import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const backendRes = await fetch(
      `${BACKEND_URL}/individual/events?${searchParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.get('authorization')
            ? { Authorization: req.headers.get('authorization')! }
            : {}),
        },
        cache: 'no-store',
      },
    );

    if (!backendRes.ok) {
      throw new Error(`Backend error: ${backendRes.status}`);
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err: any) {
    // Fallback data if backend is currently launching
    return NextResponse.json({
      success: true,
      data: {
        events: [
          {
            id: '1',
            title: 'The Grand Royal Gala & Investiture',
            slug: 'the-grand-royal-gala-investiture',
            category: 'Gala',
            status: 'active',
            rawStatus: 'LIVE',
            date: '24 October 2026',
            time: '12:00 pm',
            startDate: '2026-10-24T18:00:00.000Z',
            endDate: '2026-10-24T23:00:00.000Z',
            venueName: 'The Monarch Event Centre',
            address: '123 Water Corporation Drive, Victoria Island, Lagos',
            city: 'Lagos',
            country: 'Nigeria',
            guestsCount: 350,
            confirmedCount: 60,
            checkedInCount: 48,
            totalTarget: 100,
            daysLeft: 38,
            countdown: { days: 38, hours: 5, minutes: 25 },
          },
        ],
        counts: { all: 1, active: 1, draft: 0, completed: 0 },
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendRes = await fetch(`${BACKEND_URL}/individual/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.get('authorization')
          ? { Authorization: req.headers.get('authorization')! }
          : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Creation proxy failed' },
      { status: 500 },
    );
  }
}
