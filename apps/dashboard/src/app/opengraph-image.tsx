import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AgentMD — Make Your Repository Agent-Ready';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          padding: 48,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 48,
            fontWeight: 700,
            color: '#f8fafc',
          }}
        >
          <span style={{ color: '#059669' }}>Agent</span>
          <span style={{ color: '#f8fafc' }}>MD</span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Make Your Repository Agent-Ready
        </div>
        <div
          style={{
            fontSize: 18,
            color: '#64748b',
            textAlign: 'center',
          }}
        >
          Parse, validate, and execute AGENTS.md • CI/CD for AI agents
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 32,
            padding: '12px 24px',
            borderRadius: 8,
            background: 'rgba(5, 150, 105, 0.2)',
            border: '1px solid rgba(5, 150, 105, 0.4)',
            color: '#34d399',
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          agentmd.online
        </div>
      </div>
    </div>,
    { ...size },
  );
}
