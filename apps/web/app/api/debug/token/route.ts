import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    console.log(token);

    return Response.json(token);
}