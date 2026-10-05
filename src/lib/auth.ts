// Hard-coded admin auth (no .env needed). Works in Node and Edge (middleware).
export const ADMIN_USERNAME = "AdminUser@gmail.com";
export const ADMIN_PASSWORD = "AdminUserPassword";
export const COOKIE_NAME = "admin-auth";
const SECRET = "coupon-site-hardcoded-secret-change-me";

export async function makeToken(): Promise<string> {
  const data = new TextEncoder().encode(
    `${ADMIN_USERNAME}:${ADMIN_PASSWORD}:${SECRET}`,
  );
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidToken(token?: string): Promise<boolean> {
  if (!token) return false;
  return token === (await makeToken());
}