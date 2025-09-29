declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: 'admin' | 'user';
      passwordResetRequired?: boolean;
    }
  }
  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user';
    passwordResetRequired?: boolean;
  }
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user';
    passwordResetRequired?: boolean;
  }
}