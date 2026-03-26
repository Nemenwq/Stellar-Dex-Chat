/**
 * Simple in-memory store for transfer status tracking.
 * 
 * LIMITATION: This store is intentionally simple and resets on server restart 
 * as there is no persistent database connected for this stage. 
 * This is suitable for real-time status polling during a user session.
 */

export interface TransferStatusRecord {
    reference: string;
    status: 'pending' | 'success' | 'failed' | 'reversed';
    amount: number;
    failureReason?: string;
    updatedAt: string;
}

// Key is the transfer reference
export const transferStore = new Map<string, TransferStatusRecord>();
