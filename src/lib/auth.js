import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    secret: process.env.AUTH_SECRET,
    trustHost: true,

    providers: [
        CredentialsProvider({
            name: "Credentials",
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                await dbConnect();

                const user = await User.findOne({ email: credentials.email });

                // 1. Check if user exists
                if (!user) return null;

                // 2. Check if password is correct
                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );
                if (!isPasswordCorrect) return null;

                // 3. IMPORTANT: Check if role is admin
                // Agar role admin nahi hai, to login allow nahi hoga
                if (user.role !== "admin") {
                    throw new Error("Access Denied: Only admins can login here.");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        },
    },

    pages: {
        signIn: "/login",
        error: "/login", // Error hone par wapas login page par bheje
    },

    session: { strategy: "jwt" },
});