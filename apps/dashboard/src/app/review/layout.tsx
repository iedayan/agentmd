import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leave a Review — AgentMD',
  description:
    'Share your experience with AgentMD. Your feedback helps us improve and helps other teams discover agent-ready workflows.',
};

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
