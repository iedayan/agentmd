import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/register-form';
import { Nav } from '@/components/landing/nav';

export const metadata = {
  title: 'Create your account — AgentMD',
  description: 'Get started with AgentMD free, or start your Pro trial.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="flex items-center justify-center px-4 py-16 md:py-24">
        <Suspense>
          <RegisterForm />
        </Suspense>
      </main>
    </div>
  );
}
