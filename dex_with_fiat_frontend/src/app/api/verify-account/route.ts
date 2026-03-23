import { NextRequest, NextResponse } from 'next/server';
import { getPayoutProvider } from '@/lib/payout/providers/registry';

export async function POST(request: NextRequest) {
    try {
        const { accountNumber, bankCode } = await request.json();

        if (!accountNumber || !bankCode) {
            return NextResponse.json(
                { success: false, message: 'Account number and bank code are required' },
                { status: 400 }
            );
        }

        const provider = getPayoutProvider();
        const data = await provider.verifyAccount({ accountNumber, bankCode });

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error: unknown) {
        console.error('Account verification error:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 400 }
            );
        }

        // Check if it's a Paystack API error
        if (error && typeof error === 'object' && 'response' in error &&
            error.response && typeof error.response === 'object' && 'status' in error.response &&
            error.response.status === 422) {
            return NextResponse.json(
                { success: false, message: 'Invalid account number or bank code' },
                { status: 400 }
            );
        }

        if (error && typeof error === 'object' && 'response' in error &&
            error.response && typeof error.response === 'object' && 'data' in error.response &&
            error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
            return NextResponse.json(
                { success: false, message: (error.response.data as { message: string }).message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Account verification failed. Please try again.' },
            { status: 500 }
        );
    }
}
