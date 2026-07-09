import { loadEnv } from "@repo/backend-common/loadEnv"
loadEnv();
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { prisma } from "@repo/db/prisma";
import { SigninSchema } from "@repo/common/types";
import bcrypt from "bcrypt"

export const NEXT_AUTH_CONFIG : NextAuthOptions = {
    providers: [
        CredentialsProvider ({
            name: "credentials",
            credentials: {
                identifier: {
                    label: "Email or Username",
                    type: "text",
                    placeholder: "Enter your email or username",
                },
                password: {
                    label: "Password",
                    type: "password",
                    placeholder: "Enter your password",
                },
            },
            async authorize(credentials) {
                const parsed = SigninSchema.safeParse(credentials);

                if (!parsed.success) {
                    return null;
                }

                const { identifier, password } = parsed.data;

                try {
                    const user = await prisma.user.findFirst({
                        where: {
                            OR: [
                                { email: identifier },
                                { username: identifier },
                            ],
                        },
                    });

                    if (!user) {
                        return null;
                    }

                    if (!user.isVerified) {
                        return null;
                    }

                    const isPasswordCorrect = await bcrypt.compare(password, user.password);

                    if (!isPasswordCorrect) {
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.username,
                        username: user.username,
                        isVerified: user.isVerified,
                    };
                } catch (error) {
                    console.error(error);
                    return null;
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.isVerified = user.isVerified;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.username = token.username as string;
                session.user.isVerified = token.isVerified as boolean;
            }

            return session;
        }
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/signin',
    },
}