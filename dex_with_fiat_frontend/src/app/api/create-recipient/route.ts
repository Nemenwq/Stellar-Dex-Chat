import { NextRequest, NextResponse } from 'next/server';
import { getPayoutProvider } from '@/lib/payout/providers/registry';

export async function POST(request: NextRequest) {
    try {
        const { type, name, account_number, bank_code, currency } = await request.json();

        if (!type || !name || !account_number || !bank_code || !currency) {
            return NextResponse.json(
                { success: false, message: 'All fields are required' },
                { status: 400 }
            );
        }

        const provider = getPayoutProvider();
        const data = await provider.createRecipient({
            type,
            name,
            account_number,
            bank_code,
            currency
        });

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error: unknown) {
        console.error('Create recipient error:', error);

        // Handle Paystack API errors
        if (error && typeof error === 'object' && 'response' in error &&
            error.response && typeof error.response === 'object' && 'data' in error.response &&
            error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
            return NextResponse.json(
                { success: false, message: (error.response.data as { message: string }).message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Failed to create recipient. Please try again.' },
            { status: 500 }
        );
    }
}
