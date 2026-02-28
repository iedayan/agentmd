import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const WIDTH = 1200;
const HEIGHT = 630;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? 'AgentMD';
  const description = searchParams.get('description') ?? 'Make Your Repository Agent-Ready';
  const score = searchParams.get('score');
  const site = searchParams.get('site') ?? 'agentmd.online';

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
          gap: score ? 32 : 24,
          padding: 48,
        }}
      >
        {score ? (
          <>
            <div
              style={{
                fontSize: 20,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Agent-readiness score
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 120,
                  fontWeight: 700,
                  color: '#059669',
                  lineHeight: 1,
                }}
              >
                {score}
              </span>
              <span
                style={{
                  fontSize: 48,
                  color: '#64748b',
                  marginBottom: 12,
                }}
              >
                / 100
              </span>
            </div>
            <div
              style={{
                fontSize: 24,
                color: '#94a3b8',
                textAlign: 'center',
              }}
            >
              {title}
            </div>
          </>
        ) : (
          <>
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
              {title}
            </div>
            {description && (
              <div
                style={{
                  fontSize: 18,
                  color: '#64748b',
                  textAlign: 'center',
                  maxWidth: 700,
                }}
              >
                {description}
              </div>
            )}
          </>
        )}
        <div
          style={{
            display: 'flex',
            marginTop: 24,
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
          {site}
        </div>
      </div>
    </div>,
    { width: WIDTH, height: HEIGHT },
  );
}
