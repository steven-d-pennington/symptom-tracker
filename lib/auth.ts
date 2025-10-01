import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare, hash } from "bcryptjs";
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = CredentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await compare(password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user = {
          ...session.user,
          id: token.sub,
        } as typeof session.user & { id: string };
      }
      return session;
    },
  },
};

export const { auth, signIn, signOut } = NextAuth(authConfig);

export async function createUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const hashedPassword = await hash(password, 12);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
}