import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AGENTS.md Research & Best Practices — AgentMD',
  description:
    'Research-backed guidance on AGENTS.md: when it works (28% faster, 16% cheaper), when it fails (bloat hurts), and what to include. Quality beats quantity.',
  keywords: ['AGENTS.md', 'agentic AI', 'best practices', 'research', 'agent context'],
};

export default function ResearchBestPracticesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
