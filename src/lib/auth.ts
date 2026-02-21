import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { db } from "@/db/index";
import { requireEnv } from "./utils";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),

    // Standard Email/Password authentication
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },

    // Social Providers
    socialProviders: {
        github: {
            clientId: requireEnv("GITHUB_CLIENT_ID"),
            clientSecret: requireEnv("GITHUB_CLIENT_SECRET"),
        },
        google: {
            clientId: requireEnv("GOOGLE_CLIENT_ID"),
            clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
        },
    },

    plugins: [
        // Magic Link authentication
        magicLink({
            sendMagicLink: async ({ email, token, url}, ctx) => {
                // Send email to the user
            }
        })
    ]
});