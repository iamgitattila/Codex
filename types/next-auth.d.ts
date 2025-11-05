import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      profile?: any;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    profile?: any;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    profile?: any;
  }
}
