/**
 * In-memory device code store for the CLI login flow.
 * Each entry expires after 10 minutes.
 * Swap Map → Redis/DB for multi-instance deployments.
 */

import { randomBytes } from 'crypto';

export interface DeviceCodeEntry {
    userCode: string;
    expiresAt: number;
    userId?: string;
    token?: string;
    status: 'pending' | 'approved' | 'expired';
}

const store = new Map<string, DeviceCodeEntry>();

/** Remove expired entries (called on write paths). */
function sweep() {
    const now = Date.now();
    for (const [k, v] of store) {
        if (v.expiresAt < now) {
            store.set(k, { ...v, status: 'expired' });
        }
    }
}

/** Generate a new device code pair. deviceCode is sent to the CLI; userCode is displayed in the browser. */
export function createDeviceCode(): { deviceCode: string; userCode: string } {
    sweep();
    const deviceCode = randomBytes(16).toString('hex'); // 32 char hex, sent to CLI
    const rawUser = randomBytes(4).toString('hex').toUpperCase(); // e.g. "A3F2B1C9"
    const userCode = `${rawUser.slice(0, 4)}-${rawUser.slice(4)}`; // "A3F2-B1C9"

    store.set(deviceCode, {
        userCode,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
        status: 'pending',
    });

    return { deviceCode, userCode };
}

export function getDeviceCode(deviceCode: string): DeviceCodeEntry | undefined {
    const entry = store.get(deviceCode);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now() && entry.status === 'pending') {
        store.set(deviceCode, { ...entry, status: 'expired' });
        return store.get(deviceCode);
    }
    return entry;
}

/** Look up deviceCode by the human-readable userCode. */
export function findByUserCode(userCode: string): string | undefined {
    sweep();
    const normalized = userCode.trim().toUpperCase();
    for (const [deviceCode, entry] of store) {
        if (entry.userCode === normalized && entry.status === 'pending') {
            return deviceCode;
        }
    }
    return undefined;
}

/** Approve a pending device code and attach a token. */
export function approveDeviceCode(deviceCode: string, userId: string, token: string): boolean {
    const entry = store.get(deviceCode);
    if (!entry || entry.status !== 'pending' || entry.expiresAt < Date.now()) return false;
    store.set(deviceCode, { ...entry, status: 'approved', userId, token });
    return true;
}
