import 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    firstName: string;
    lastName: string;
    role: Role;
  }

  interface Session {
    user: User & {
      firstName: string;
      lastName: string;
      role: Role;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    role: Role;
  }
}
