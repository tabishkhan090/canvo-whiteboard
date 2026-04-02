import "dotenv/config";
const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error("JWT_SECRET is not defined");
}
console.log(secret);
export const JWT_SECRET = secret;