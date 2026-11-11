import { NextRequest, NextResponse } from 'next/server';

const PIXEL_ID = process.env.META_PIXEL_ID || '1580985547376513';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

export async function POST(req: NextRequest) {
  if (!ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'Missing META_ACCESS_TOKEN in server environment' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { eventName, eventId, eventSourceUrl, customData, testEventCode } = body;

    // Grab the first IP string from x-forwarded-for safely
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp =
      (forwardedFor ? forwardedFor.split(',')[0].trim() : '') ||
      req.headers.get('x-real-ip') ||
      '';
    const userAgent = req.headers.get('user-agent') || '';

    const fbp = req.cookies.get('_fbp')?.value;
    const fbc = req.cookies.get('_fbc')?.value;

    const payload: Record<string, unknown> = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: eventSourceUrl,
          action_source: 'website',
          user_data: {
            ...(clientIp && { client_ip_address: clientIp }),
            ...(userAgent && { client_user_agent: userAgent }),
            ...(fbp && { fbp }),
            ...(fbc && { fbc }),
          },
          ...(customData && { custom_data: customData }),
        },
      ],
    };

    if (testEventCode) {
      payload.test_event_code = testEventCode;
    }

    const response = await fetch(
      `https://facebook.com{PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: result }, { status: response.status });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to send event to Meta',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
