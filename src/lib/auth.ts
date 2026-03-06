import * as schema from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink, openAPI } from "better-auth/plugins";
import { db } from "@/db/index";
import { requireEnv } from "./utils";
import { Resend } from "resend";
import { MagicLinkEmail } from "./emails/magicLink";

const resend = new Resend(requireEnv("RESEND_API_KEY"));

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.users,
            session: schema.sessions,
            verification: schema.verifications,
            account: schema.accounts,
        }
    }),

    basePath: "/api/v1/auth",

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
        openAPI(),
        magicLink({
            sendMagicLink: async ({ email, token, url }, ctx) => {
                try {
                    const { data, error } = await resend.emails.send({
                        from: requireEnv("EMAIL_FROM"),
                        to: email,
                        subject: "Sign in to your account",
                        react: MagicLinkEmail({ url, email }),
                    });

                    if (error) {
                        console.error("Failed to send magic link email:", error);
                        throw new Error("Failed to send magic link email");
                    }

                    console.log("Magic link email sent successfully:", data);
                } catch (err) {
                    console.error("Error sending magic link email:", err);
                    throw err;
                }
            }
        })
    ]
});