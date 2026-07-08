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
            id: "Credentials",
            name: "Credentials",
            credentials: {
                email: {label: 'Email', type: 'email', placeholder: 'Enter your Email or username'},
                password: {label: 'password', type: 'text', placeholder: 'Enter your password'},
            },
            async authorize(credentials: any ) :Promise<any> {
                try{
                    const user = await prisma.user.findFirst({
                        where: {
                            OR: [
                                { email: credentials.identifier },
                                { username: credentials.identifier },
                            ],
                        },
                    });
                    if(!user){
                        throw new Error('No user found with this email');
                    }
                    if(!user.isVerified){
                        throw new Error('please verify your account before logging in');
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if(!isPasswordCorrect)
                        throw new Error('Invalid Password');
                    return user;
                }catch(error: any){
                    throw new Error( error );
                }
            }
        }),
    ],
    callbacks: {
        jwt: async ({token,user} : any) => {
            if(user){
                token.id = user.id.toString();
                token.isVerified = user.isVerified;
                token.username = user.username;
            }
            return token;
        },
        session: async ({session, token} : any) => {
            if(token){
                session.id = token.id.toString();
                session.isVerified = token.isVerified;
                session.username = token.username;
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