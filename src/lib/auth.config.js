import CredentialsProvider from "next-auth/providers/credentials";

export default {
    providers: [
        CredentialsProvider({
            async authorize(credentials) {
                // Skeleton logic for middleware
                return null;
            },
        }),
    ],
    // Middleware ko secret yahan se bhi milna chahiye
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};