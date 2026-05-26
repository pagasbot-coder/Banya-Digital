import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { StaffRole } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: StaffRole;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: StaffRole;
  }
}

/** Auth.js v5 — staff credentials; JWT session for Credentials provider. */
export const { handlers, auth, signIn, signOut } = NextAuth({
  // PrismaAdapter: user rows in PostgreSQL; JWT sessions (Credentials). Cast — @auth/core version skew.
  adapter: PrismaAdapter(prisma) as never,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Учётная запись персонала",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!isDatabaseConfigured()) {
          return null;
        }

        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        const staff = user as { role?: StaffRole };
        if (staff.role) {
          token.role = staff.role;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as StaffRole) ?? "ops";
      }
      return session;
    },
  },
});
