'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

type PricingModel = 'free' | 'one-time' | 'subscription' | 'usage-based';
type Step = 'connect' | 'list' | 'done';

interface FormState {
    name: string;
    description: string;
    agentsMdUrl: string;
    category: string;
    pricingModel: PricingModel;
    priceInCents: string;
    capabilities: string;
    sellerId: string;
    sellerName: string;
    authToken: string;
}

const CARD_STYLE: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1.25rem',
    backdropFilter: 'blur(20px)',
    padding: '2rem',
    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
};

const INPUT_STYLE: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '0.65rem',
    padding: '0.65rem 0.85rem',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
};

const LABEL_STYLE: React.CSSProperties = {
    display: 'block',
    color: 'rgba(255,255,255,0.55)',
    fontSize: '0.8rem',
    marginBottom: '0.35rem',
};

const BTN_PRIMARY: React.CSSProperties = {
    background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
    border: 'none',
    borderRadius: '0.75rem',
    padding: '0.75rem 1.5rem',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
};

export default function SellPage() {
    const searchParams = useSearchParams();
    const initialStep: Step = searchParams.get('connected') === 'true' ? 'list' : 'connect';

    const [step, setStep] = useState<Step>(initialStep);
    const [connectLoading, setConnectLoading] = useState(false);
    const [connectError, setConnectError] = useState('');

    const [form, setForm] = useState<FormState>({
        name: '',
        description: '',
        agentsMdUrl: '',
        category: 'general',
        pricingModel: 'free',
        priceInCents: '',
        capabilities: '',
        sellerId: '',
        sellerName: '',
        authToken: '',
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // ── Step 1: Connect Stripe ─────────────────────────────────────────────────

    async function handleConnectStripe() {
        setConnectLoading(true);
        setConnectError('');
        try {
            const res = await fetch('/api/stripe/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sellerId: form.sellerId || 'seller', returnUrl: window.location.href + '?connected=true', refreshUrl: window.location.href }),
            });
            const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
            if (!res.ok || !data.ok) {
                setConnectError(data.error ?? 'Failed to start Stripe onboarding.');
                return;
            }
            if (data.url) window.location.href = data.url;
        } catch {
            setConnectError('Network error. Please try again.');
        } finally {
            setConnectLoading(false);
        }
    }

    // ── Step 2: List agent ─────────────────────────────────────────────────────

    function field(key: keyof FormState, label: string, placeholder = '', type = 'text') {
        return (
            <div style={{ marginBottom: '1rem' }}>
                <label style={LABEL_STYLE}>{label}</label>
                <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    style={INPUT_STYLE}
                />
            </div>
        );
    }

    async function handleSubmitAgent(e: React.FormEvent) {
        e.preventDefault();
        setSubmitLoading(true);
        setSubmitError('');
        try {
            const priceInCents = parseInt(form.priceInCents || '0', 10) || 0;
            const pricing: Record<string, unknown> = { model: form.pricingModel };
            if (form.pricingModel === 'one-time') pricing.oneTimePrice = priceInCents;
            if (form.pricingModel === 'subscription') pricing.subscriptionPrice = priceInCents;
            if (form.pricingModel === 'usage-based') pricing.usagePrice = priceInCents;

            const res = await fetch('/api/marketplace/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${form.authToken}`,
                },
                body: JSON.stringify({
                    name: form.name,
                    description: form.description,
                    agentsMdUrl: form.agentsMdUrl,
                    pricing,
                    sellerId: form.sellerId,
                    sellerName: form.sellerName,
                    category: form.category,
                    capabilities: form.capabilities.split(',').map((c) => c.trim()).filter(Boolean),
                }),
            });
            const data = (await res.json()) as { ok: boolean; error?: string };
            if (!res.ok || !data.ok) {
                setSubmitError(data.error ?? 'Submission failed.');
                return;
            }
            setStep('done');
        } catch {
            setSubmitError('Network error. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    }

    // ── Layout ─────────────────────────────────────────────────────────────────

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg,#0f0f1a 0%,#1a1030 60%,#0f1a2a 100%)',
                padding: '2.5rem 1rem',
                fontFamily: "'Inter',system-ui,sans-serif",
                color: '#fff',
            }}
        >
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.4rem' }}>Sell on AgentMD</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                        Publish your agent. Keep 85% of every sale.
                    </p>
                </div>

                {/* Step indicator */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
                    {(['connect', 'list', 'done'] as Step[]).map((s, i) => (
                        <div
                            key={s}
                            style={{
                                padding: '0.35rem 1rem',
                                borderRadius: '2rem',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                background: step === s ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.08)',
                                color: step === s ? '#fff' : 'rgba(255,255,255,0.4)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
                        </div>
                    ))}
                </div>

                {/* ── Step 1: Connect Stripe ── */}
                {step === 'connect' && (
                    <div style={CARD_STYLE}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                            Connect Your Stripe Account
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
                            We use Stripe Express to send your payouts automatically. AgentMD keeps a 15% platform fee.
                            You&apos;ll need to complete a brief KYC verification with Stripe.
                        </p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={LABEL_STYLE}>Your Seller ID (choose a unique handle)</label>
                            <input
                                type="text"
                                placeholder="my-agent-studio"
                                value={form.sellerId}
                                onChange={(e) => setForm((f) => ({ ...f, sellerId: e.target.value }))}
                                style={INPUT_STYLE}
                            />
                        </div>

                        {connectError && (
                            <div
                                style={{
                                    background: 'rgba(239,68,68,0.12)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: '0.5rem',
                                    padding: '0.6rem 0.9rem',
                                    color: '#fca5a5',
                                    fontSize: '0.85rem',
                                    marginBottom: '1rem',
                                }}
                            >
                                {connectError}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button onClick={handleConnectStripe} disabled={connectLoading} style={BTN_PRIMARY}>
                                {connectLoading ? 'Redirecting…' : '⚡ Connect Stripe'}
                            </button>
                            <button
                                onClick={() => setStep('list')}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '0.75rem',
                                    padding: '0.75rem 1.25rem',
                                    color: 'rgba(255,255,255,0.6)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                }}
                            >
                                Skip for now
                            </button>
                        </div>

                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '1rem', marginBottom: 0 }}>
                            Payouts are only possible after Stripe Connect is set up on the dashboard
                            (STRIPE_SECRET_KEY must be configured).
                        </p>
                    </div>
                )}

                {/* ── Step 2: List an agent ── */}
                {step === 'list' && (
                    <div style={CARD_STYLE}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1.5rem' }}>List Your Agent</h2>
                        <form onSubmit={handleSubmitAgent}>
                            {field('authToken', 'API Token (from agentmd login)', 'Paste your token here')}
                            {field('name', 'Agent Name', 'PR Reviewer Pro')}
                            {field('description', 'Description (1–2 sentences)', 'AI-powered PR reviews with security checks')}
                            {field('agentsMdUrl', 'AGENTS.md URL', 'https://github.com/you/agent/blob/main/AGENTS.md', 'url')}
                            {field('sellerId', 'Seller ID', 'my-agent-studio')}
                            {field('sellerName', 'Display Name', 'My Agent Studio')}
                            {field('category', 'Category', 'code-review')}
                            {field('capabilities', 'Capabilities (comma-separated)', 'PR analysis, Security checks, Auto-merge')}

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={LABEL_STYLE}>Pricing Model</label>
                                <select
                                    value={form.pricingModel}
                                    onChange={(e) => setForm((f) => ({ ...f, pricingModel: e.target.value as PricingModel }))}
                                    style={{ ...INPUT_STYLE, background: 'rgba(255,255,255,0.07)' }}
                                >
                                    <option value="free">Free</option>
                                    <option value="one-time">One-time purchase</option>
                                    <option value="subscription">Monthly subscription</option>
                                    <option value="usage-based">Usage-based</option>
                                </select>
                            </div>

                            {form.pricingModel !== 'free' && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={LABEL_STYLE}>Price (in cents, e.g. 999 = $9.99)</label>
                                    <input
                                        type="number"
                                        placeholder="999"
                                        value={form.priceInCents}
                                        onChange={(e) => setForm((f) => ({ ...f, priceInCents: e.target.value }))}
                                        style={INPUT_STYLE}
                                        min={1}
                                    />
                                </div>
                            )}

                            {submitError && (
                                <div
                                    style={{
                                        background: 'rgba(239,68,68,0.12)',
                                        border: '1px solid rgba(239,68,68,0.3)',
                                        borderRadius: '0.5rem',
                                        padding: '0.6rem 0.9rem',
                                        color: '#fca5a5',
                                        fontSize: '0.85rem',
                                        marginBottom: '1rem',
                                    }}
                                >
                                    {submitError}
                                </div>
                            )}

                            <button type="submit" disabled={submitLoading} style={{ ...BTN_PRIMARY, width: '100%' }}>
                                {submitLoading ? 'Submitting…' : '🚀 List Agent'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Done ── */}
                {step === 'done' && (
                    <div style={{ ...CARD_STYLE, textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '0.75rem' }}>🎉</div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Agent Listed!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '2rem' }}>
                            Your agent is now live in the AgentMD Marketplace. It will be reviewed and certified by our team.
                        </p>
                        <a
                            href="/dashboard/marketplace"
                            style={{ ...BTN_PRIMARY, textDecoration: 'none', display: 'inline-block' }}
                        >
                            View Marketplace →
                        </a>
                    </div>
                )}

                {/* Info strip */}
                <div
                    style={{
                        display: 'flex',
                        gap: '1.5rem',
                        marginTop: '2rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    {[
                        { icon: '💸', label: '85% revenue share' },
                        { icon: '⚡', label: 'Instant Stripe payouts' },
                        { icon: '🔒', label: 'Commercial licensing' },
                        { icon: '🏆', label: 'Certified badge' },
                    ].map(({ icon, label }) => (
                        <div
                            key={label}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                color: 'rgba(255,255,255,0.45)',
                                fontSize: '0.82rem',
                            }}
                        >
                            <span>{icon}</span>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
