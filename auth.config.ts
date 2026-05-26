import type { NextAuthConfig } from "next-auth";
import type { StaffRole } from "@prisma/client";

/** Edge-safe Auth.js config — no Prisma/bcrypt (middleware + Vercel Edge). */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: {
    signIn: "/login",
  },
  providers: [],
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
} satisfies NextAuthConfig;
