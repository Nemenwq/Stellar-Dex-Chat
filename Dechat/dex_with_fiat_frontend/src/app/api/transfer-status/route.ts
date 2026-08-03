import { NextRequest, NextResponse } from 'next/server';

import { getPayoutProvider } from '@/lib/payout/providers/registry';
<<<<<<< HEAD

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { success: false, message: 'Reference is required' },
=======
import { applyRateLimit, getClientIp } from '@/lib/rateLimit';
import { transferStatusSchema } from '@/lib/apiSchemas';

const RATE_LIMIT = { maxRequests: 10, windowMs: 60_000 };

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(ip, '/api/transfer-status', RATE_LIMIT);
  if (limited) return limited;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Request body must be valid JSON' },
>>>>>>> emwulrd/main
        { status: 400 },
      );
    }

<<<<<<< HEAD
=======
    const validationResult = transferStatusSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { reference } = validationResult.data;

>>>>>>> emwulrd/main
    const provider = getPayoutProvider();
    const data = await provider.checkTransferStatus({ reference });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error('Transfer status error:', error);

    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data
    ) {
      return NextResponse.json(
        {
          success: false,
          message: (error.response.data as { message: string }).message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch transfer status. Please try again.',
      },
      { status: 500 },
    );
  }
}
