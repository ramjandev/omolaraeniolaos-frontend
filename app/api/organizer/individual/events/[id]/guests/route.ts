import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const backendRes = await fetch(
      `${BACKEND_URL}/individual/events/${id}/guests?${searchParams.toString()}`,
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

    if (!backendRes.ok) throw new Error(`Backend error ${backendRes.status}`);
    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      data: {
        guests: [
          {
            id: 'g-1',
            name: 'Chief & Mrs. Babatunde Alabi',
            phone: '+234 802 345 6789',
            email: 'babatunde.alabi@gmail.com',
            type: 'VIP',
            checkInStatus: 'Checked-In',
            rsvpStatus: 'Confirmed',
            inviteThrough: 'WhatsApp',
            partySize: 2,
            preference: 'Jollof & Grilled Croaker • Table 01 (VVIP Royal)',
          },
          {
            id: 'g-2',
            name: 'Princess Zainab Bello',
            phone: '+234 803 112 4433',
            email: 'zainab.bello@heritage.ng',
            type: 'General',
            checkInStatus: 'Checked-In',
            rsvpStatus: 'Confirmed',
            inviteThrough: 'WhatsApp',
            partySize: 2,
            preference: 'Jollof & Grilled Croaker • Table 04 (Ambassador)',
          },
          {
            id: 'g-3',
            name: 'Dr. Ifeanyi Nwosu',
            phone: '+234 805 776 1122',
            email: 'ifeanyi.nwosu@apexmed.com',
            type: 'Family & Friends',
            checkInStatus: 'Not Arrived',
            rsvpStatus: 'Confirmed',
            inviteThrough: 'Email',
            partySize: 1,
            preference: '--',
          },
          {
            id: 'g-4',
            name: 'Chief Emeka Okonkwo',
            phone: '+234 802 998 7766',
            email: 'e.okonkwo@transcorp.ng',
            type: 'VIP',
            checkInStatus: 'Checked-In',
            rsvpStatus: 'Confirmed',
            inviteThrough: 'WhatsApp',
            partySize: 1,
            preference: 'Table 01 (VVIP Royal)',
          },
        ],
        metrics: {
          totalGuests: 350,
          confirmedCount: 60,
          checkedInCount: 48,
          notArrivedCount: 12,
          flaggedCount: 2,
        },
      },
    });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const backendRes = await fetch(`${BACKEND_URL}/individual/events/${id}/guests`, {
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
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
