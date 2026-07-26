import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    nucleoId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      nucleoId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    nucleoId?: string | null;
  }
}
