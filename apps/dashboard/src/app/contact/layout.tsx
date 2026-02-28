import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — AgentMD',
  description: 'Get in touch with the AgentMD team. Questions, feedback, or partnership inquiries.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
