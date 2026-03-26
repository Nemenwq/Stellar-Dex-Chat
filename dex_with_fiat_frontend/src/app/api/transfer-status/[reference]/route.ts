import { NextRequest, NextResponse } from 'next/server';
import { transferStore } from '@/lib/transferStore';

export async function GET(
    request: NextRequest,
    { params }: { params: { reference: string } }
) {
    const { reference } = params;

    if (!reference) {
        return NextResponse.json(
            { success: false, message: 'Reference is required' },
            { status: 400 }
        );
    }

    const record = transferStore.get(reference);

    if (!record) {
        return NextResponse.json(
            { success: false, message: 'Transfer status not found' },
            { status: 404 }
        );
    }

    return NextResponse.json({
        success: true,
        data: record,
    });
}
