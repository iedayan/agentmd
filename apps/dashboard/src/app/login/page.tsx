import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { RegisterForm } from '@/components/auth/register-form';
import { Nav } from '@/components/landing/nav';

export const metadata = {
  title: 'Sign in — AgentMD',
  description: 'Sign in to your AgentMD account.',
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="flex items-center justify-center px-4 py-16 md:py-24">
        <RegisterForm mode="login" />
      </main>
    </div>
  );
}
