"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isTokenExpired } from "@/lib/isTokenExpired";

/**
 * useAuthGuard
 * - Checks token existence + expiry on mount
 * - Redirects to /login if missing or expired (and clears it)
 * - Keeps checking every 30s in case the token expires while the
 *   user is sitting on the same page without navigating
 * - Returns `checking` so pages/layouts can show a loader until verified
 */
export default function useAuthGuard() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const verify = () => {
            const token = localStorage.getItem("token");
            if (!token || isTokenExpired(token)) {
                localStorage.removeItem("token");
                router.push("/login");
                return false;
            }
            return true;
        };

        if (verify()) {
            setChecking(false);
        }

        // Re-check every 30 seconds in case token expires mid-session
        const interval = setInterval(() => {
            verify();
        }, 30000);

        return () => clearInterval(interval);
    }, [router]);

    return { checking };
}