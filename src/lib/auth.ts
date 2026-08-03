import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Necessário no Vercel: sem isso, o NextAuth pode rejeitar o cookie de
  // sessão se o domínio real não bater exatamente com AUTH_URL, o que
  // aparenta um "logout" aleatório ao navegar pelo portal.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.nome,
          role: user.role,
          nucleoId: user.nucleoId,
          precisaTrocarSenha: user.precisaTrocarSenha,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.nucleoId = user.nucleoId;
        token.precisaTrocarSenha = user.precisaTrocarSenha;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.nucleoId = token.nucleoId as string | null;
        session.user.precisaTrocarSenha = token.precisaTrocarSenha as boolean;
      }
      return session;
    },
  },
});
