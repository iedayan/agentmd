'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function DeviceAuthContent() {
    const searchParams = useSearchParams();
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
                        marginBottom: '1rem',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    <svg width="64" height="64" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 16px rgba(139,92,246,0.6))' }}>
                        <rect width="256" height="256" rx="64" fill="url(#bg-gradient)" />
                        <path d="M128 40C79.3989 40 40 79.3989 40 128C40 176.601 79.3989 216 128 216C176.601 216 216 176.601 216 128C216 79.3989 176.601 40 128 40ZM128 60C165.555 60 196 90.4446 196 128C196 165.555 165.555 196 128 196C90.4446 196 60 165.555 60 128C60 90.4446 90.4446 60 128 60Z" fill="url(#ring-glow)" opacity="0.15" />
                        <path d="M128 50C84.9218 50 50 84.9218 50 128C50 171.078 84.9218 206 128 206C171.078 206 206 171.078 206 128C206 84.9218 171.078 50 128 50ZM128 66C162.242 66 190 93.7584 190 128C190 162.242 162.242 190 128 190C93.7584 190 66 162.242 66 128C66 93.7584 93.7584 66 128 66Z" fill="url(#ring-glow)" opacity="0.3" />
                        <path d="M96 94L136 122L96 150" stroke="#00F0FF" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M136 162H168" stroke="#00F0FF" strokeWidth="18" strokeLinecap="round" />
                        <path d="M116 80H140V176H116V80Z" fill="#A855F7" opacity="0.15" />
                        <path d="M80 116H176V140H80V116Z" fill="#A855F7" opacity="0.15" />
                        <defs>
                            <linearGradient id="bg-gradient" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#0F0F1A" />
                                <stop offset="50%" stopColor="#1A1030" />
                                <stop offset="100%" stopColor="#241B4D" />
                            </linearGradient>
                            <linearGradient id="ring-glow" x1="40" y1="40" x2="216" y2="216" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#7C3AED" />
                                <stop offset="100%" stopColor="#00F0FF" />
                            </linearGradient>
                        </defs>
                    </svg>
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

export default function DeviceAuthPage() {
    return (
        <Suspense fallback={<div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1030 50%, #0f1a2a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>Loading authentication...</div>}>
            <DeviceAuthContent />
        </Suspense>
    );
}
