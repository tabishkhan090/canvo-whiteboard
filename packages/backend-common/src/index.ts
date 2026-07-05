function getEnv(key: string): string {
    const value = process.env[key];

    if (!value) {
        throw new Error(`${key} is not defined`);
    }

    return value;
}

export const env = {
    JWT_SECRET: getEnv("JWT_SECRET"),
    DATABASE_URL: getEnv("DATABASE_URL"),
    // PORT: getEnv("PORT"),
    // REDIS_URL: getEnv("REDIS_URL"),
} as const;