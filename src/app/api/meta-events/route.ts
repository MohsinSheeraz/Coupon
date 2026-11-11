import { NextRequest, NextResponse } from 'next/server';
import https from 'node:https';

const PIXEL_ID = (process.env.META_PIXEL_ID || '1580985547376513').trim();
const ACCESS_TOKEN = (process.env.META_ACCESS_TOKEN || '').trim();

function postToMeta(url: string, body: string): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        family: 4, // Force IPv4 so Vercel never stalls on IPv6
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 500, data: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode || 500, data: raw });
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

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

    const metaUrl = `https://facebook.com{PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`;
    const { status, data } = await postToMeta(metaUrl, JSON.stringify(payload));

    if (status < 200 || status >= 300) {
      return NextResponse.json({ error: data }, { status });
    }

    return NextResponse.json({ success: true, result: data });
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
