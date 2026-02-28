import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { hasDatabase } from '../data/db';

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
      authorization: {
        params: { scope: 'read:user user:email' },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (hasDatabase() && user?.id) {
        const { ensureUser } = await import('../data/dashboard-data-db');
        await ensureUser(user.id, {
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        });
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/register',
    error: '/register',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
