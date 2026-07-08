import { DefaultSession } from "next-auth";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
        id: string;
        isVerified: boolean;
        username: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        isVerified: boolean;
        username: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        isVerified: boolean;
        username: string;
    }
}