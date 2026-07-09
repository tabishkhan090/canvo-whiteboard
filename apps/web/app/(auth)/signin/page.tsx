"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignInPage() {
    const router = useRouter();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setLoading(true);

        const result = await signIn("credentials", {
            redirect: false,
            identifier,
            password,
        });

        setLoading(false);

        if (result?.error) {
            alert(result.error);
            return;
        }

        if (result?.ok) {
            router.push("/");
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                <h1 className="mb-2 text-center text-3xl font-bold">
                    Welcome Back
                </h1>

                <p className="mb-8 text-center text-gray-500">
                    Sign in to your account
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block font-medium">
                            Email / Username
                        </label>

                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) =>
                                setIdentifier(e.target.value)
                            }
                            placeholder="Enter email or username"
                            className="w-full rounded-md border px-3 py-2 outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-medium">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter password"
                            className="w-full rounded-md border px-3 py-2 outline-none focus:border-black"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-black py-2 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}