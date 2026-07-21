/**
 * Decodes a JWT (without verifying signature — that's the backend's job)
 * and checks whether it is expired or malformed.
 *
 * Returns true if:
 *  - token is missing/empty
 *  - token can't be parsed (malformed)
 *  - token's "exp" claim is in the past
 */
export function isTokenExpired(token) {
    if (!token) return true;

    try {
        const payloadBase64 = token.split(".")[1];
        if (!payloadBase64) return true;

        // JWT uses base64url — convert to normal base64 before decoding
        const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(
            decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            )
        );

        if (!payload.exp) return true; // no expiry claim → treat as invalid

        const nowInSeconds = Date.now() / 1000;
        return payload.exp < nowInSeconds;
    } catch (e) {
        console.error("Token decode error:", e);
        return true; // malformed token → treat as expired
    }
}