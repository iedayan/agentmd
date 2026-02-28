import { Nav } from '@/components/landing/nav';

export const metadata = {
  title: 'Design System — AgentMD',
  description:
    'AgentMD design tokens and components — colors, typography, spacing, motion, buttons, badges, cards, terminal, pipeline.',
};

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Nav />
      <div className="flex-1 min-h-0">
        <iframe
          src="/design-system.html"
          className="w-full h-[calc(100vh-4rem)] min-h-[600px] border-0"
          title="AgentMD Design System"
        />
      </div>
    </div>
  );
}
