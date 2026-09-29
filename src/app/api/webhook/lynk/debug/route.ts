import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Read the raw body
    const rawBody = await req.text();
    
    // Parse JSON
    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (e) {
      parsedBody = 'Invalid JSON';
    }

    // Get relevant headers
    const headers = Object.fromEntries(req.headers.entries());

    // Log the request to Vercel/server logs
    console.log('--- LYNK.ID WEBHOOK DEBUG ---');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Raw Body:', rawBody);
    console.log('Parsed Body:', JSON.stringify(parsedBody, null, 2));
    console.log('-----------------------------');

    return NextResponse.json(
      {
        success: true,
        message: 'Webhook received and logged successfully for debugging',
        receivedData: parsedBody,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Debug Webhook Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
