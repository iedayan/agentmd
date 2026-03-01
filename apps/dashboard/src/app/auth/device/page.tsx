'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DeviceAuthPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlCode = searchParams.get('code') ?? '';

    const [userCode, setUserCode] = useState(
        // Pre-fill if the CLI passed the userCode in the URL (e.g. ?code=A3F2-B1C9)
        /^[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(urlCode) ? urlCode.toUpperCase() : '',
    );
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    async function handleApprove() {
        setStatus('loading');
        setErrorMsg('');
        try {
            const res = await fetch('/api/auth/device/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userCode }),
            });
            const data = (await res.json()) as { ok: boolean; error?: string };
            if (!res.ok || !data.ok) {
                setErrorMsg(data.error ?? 'Something went wrong. Please try again.');
                setStatus('error');
                return;
            }
            setStatus('success');
        } catch {
            setErrorMsg('Network error. Please check your connection and try again.');
            setStatus('error');
        }
    }

    return (
        <main
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1030 50%, #0f1a2a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Inter', system-ui, sans-serif",
                padding: '1rem',
            }}
        >
            <div
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '1.25rem',
                    backdropFilter: 'blur(24px)',
                    padding: '2.5rem 2rem',
                    maxWidth: 420,
                    width: '100%',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                    textAlign: 'center',
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        fontSize: '2rem',
                        marginBottom: '0.5rem',
                        filter: 'drop-shadow(0 0 16px rgba(139,92,246,0.6))',
                    }}
                >
                    🤖
                </div>
                <h1 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                    AgentMD CLI Login
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', margin: '0 0 2rem' }}>
                    Approve CLI access to your AgentMD account
                </p>

                {status === 'success' ? (
                    <div style={{ padding: '1.5rem 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
                        <p style={{ color: '#6ee7b7', fontWeight: 600, fontSize: '1.1rem', margin: '0 0 0.5rem' }}>
                            Access Approved!
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', margin: 0 }}>
                            Your CLI is now connected. You can close this tab.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Code display / input */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label
                                style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.5rem', textAlign: 'left' }}
                            >
                                Device Code (shown in your terminal)
                            </label>
                            <input
                                type="text"
                                value={userCode}
                                onChange={(e) => setUserCode(e.target.value.toUpperCase())}
                                placeholder="XXXX-YYYY"
                                maxLength={9}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    color: '#fff',
                                    fontSize: '1.25rem',
                                    letterSpacing: '0.15em',
                                    textAlign: 'center',
                                    outline: 'none',
                                    fontFamily: 'monospace',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        {errorMsg && (
                            <p
                                style={{
                                    color: '#fca5a5',
                                    fontSize: '0.85rem',
                                    background: 'rgba(239,68,68,0.12)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem 0.75rem',
                                    marginBottom: '1rem',
                                }}
                            >
                                {errorMsg}
                            </p>
                        )}

                        <button
                            onClick={handleApprove}
                            disabled={status === 'loading' || userCode.length < 9}
                            style={{
                                width: '100%',
                                padding: '0.85rem',
                                background:
                                    status === 'loading' || userCode.length < 9
                                        ? 'rgba(139,92,246,0.35)'
                                        : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '1rem',
                                cursor: status === 'loading' || userCode.length < 9 ? 'not-allowed' : 'pointer',
                                transition: 'opacity 0.2s',
                                marginBottom: '1rem',
                            }}
                        >
                            {status === 'loading' ? 'Approving…' : '✓ Approve CLI Access'}
                        </button>

                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', margin: 0 }}>
                            Only approve if you ran <code style={{ color: 'rgba(255,255,255,0.55)' }}>agentmd login</code> in your terminal.
                            This grants your CLI access to your account.
                        </p>
                    </>
                )}
            </div>
        </main>
    );
}
