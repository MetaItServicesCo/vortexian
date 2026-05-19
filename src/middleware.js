import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
    });

    const { pathname } = request.nextUrl;

    // Agar token hai aur login/register page pe ja raha hai
    if (token && (pathname === "/login" || pathname === "/register")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Agar token nahi aur protected route pe ja raha hai
    if (!token && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
    ],
};