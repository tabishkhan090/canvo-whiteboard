import { decode } from "next-auth/jwt";
import { env } from "@repo/backend-common"


// convert it into an object:
// {
//     "next-auth.session-token": "eyJ..."
// }
function getCookieMap(cookieHeader?: string) {
    return Object.fromEntries(
        (cookieHeader ?? "")
            .split(";")
            .map(cookie => cookie.trim().split("="))
            .filter(([key, value]) => key && value)
            .map(([key, ...value]) => [key, decodeURIComponent(value.join("="))])
    );
}

export async function getUserIdFromRequest(request: { url?: string; headers?: { cookie?: string } }) {
    const cookies = getCookieMap(request.headers?.cookie ?? undefined);
    // console.log(cookies);
    const payload = await decode({
        token: cookies['next-auth.session-token'],
        secret: env.NEXTAUTH_SECRET,
    });
    
    // console.log(payload);
    return payload?.id as string;
}