declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      firstName: string;
      lastName: string;
      role: 'admin' | 'user';
      passwordResetRequired?: boolean;
      emailVerified?: Date;
    }
  }
  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user';
    passwordResetRequired?: boolean;
    emailVerified?: Date;
  }
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user';
    passwordResetRequired?: boolean;
    emailVerified?: Date;
  }
}