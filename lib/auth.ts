import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { z } from 'zod';
import '../types/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authOptions = {
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        try {
          console.log('Auth attempt for:', credentials?.email);
          
          if (!credentials) {
            console.error('No credentials provided');
            return null;
          }

          const { email, password } = loginSchema.parse(credentials);

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              password: true,
              firstName: true,
              lastName: true,
              role: true,
              passwordResetRequired: true
            }
          });

          console.log('User found:', user ? 'yes' : 'no');

          if (!user?.password) {
            console.error('No user found or password not set:', email);
            return null;
          }

          const isValid = await bcrypt.compare(password, user.password);
          console.log('Password valid:', isValid);
          
          if (!isValid) {
            console.error('Invalid password for user:', email);
            return null;
          }

          const authUser = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            passwordResetRequired: user.passwordResetRequired,
          };

          console.log('Auth successful for:', email, 'Password reset required:', user.passwordResetRequired);
          return authUser;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.passwordResetRequired = user.passwordResetRequired;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.role = token.role as string;
        session.user.passwordResetRequired = token.passwordResetRequired as boolean;
      }
      return session;
    }
  },
};
