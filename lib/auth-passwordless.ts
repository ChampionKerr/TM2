import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { z } from 'zod';
import { sendMagicLinkEmail } from './email-passwordless';
import '../types/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
});

export const authOptions = {
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  
  session: {
    strategy: 'jwt' as const, // Using JWT for now, can switch to database later
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },

  providers: [
    // Magic Link Email Provider
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER || '',
          pass: process.env.EMAIL_SERVER_PASSWORD || '',
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url, provider, theme }) => {
        try {
          await sendMagicLinkEmail(identifier, url);
        } catch (error) {
          console.error('Error sending magic link email:', error);
          throw error;
        }
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),

    // Traditional Credentials Provider (fallback)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        try {
          console.log('Auth attempt for:', credentials?.email);
          
          if (!credentials) {
            console.error('No credentials provided');
            return null;
          }

          const { email, password } = loginSchema.parse(credentials);

          if (!password) {
            // Redirect to magic link flow
            console.log('No password provided, should use magic link');
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              password: true,
              firstName: true,
              lastName: true,
              role: true,
              passwordResetRequired: true,
              emailVerified: true,
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
            emailVerified: user.emailVerified,
          };

          console.log('Auth successful for:', email);
          return authUser;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'email') {
        // Magic link sign-in - ensure user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (!existingUser) {
          // Create new user for magic link
          await prisma.user.create({
            data: {
              email: user.email,
              firstName: 'New',
              lastName: 'User',
              emailVerified: new Date(),
              role: 'user',
            }
          });
        } else if (!existingUser.emailVerified) {
          // Update email verification
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: new Date() }
          });
        }

        return true;
      }
      
      if (account?.provider === 'google') {
        // OAuth sign-in
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (!existingUser) {
          // Create new user from OAuth profile
          await prisma.user.create({
            data: {
              email: user.email,
              firstName: user.name?.split(' ')[0] || 'Unknown',
              lastName: user.name?.split(' ').slice(1).join(' ') || 'User',
              emailVerified: new Date(),
              image: user.image,
              role: 'user',
            }
          });
        } else if (!existingUser.emailVerified) {
          // Update email verification if not already verified
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: new Date() }
          });
        }

        return true;
      }

      return true;
    },

    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.passwordResetRequired = user.passwordResetRequired;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },

    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.role = token.role;
        session.user.passwordResetRequired = token.passwordResetRequired;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
  },

  events: {
    async createUser({ user }: any) {
      console.log('New user created:', user.email);
    },
    async signIn({ user, account }: any) {
      console.log('User signed in:', user.email, 'via', account?.provider);
    },
  },
};