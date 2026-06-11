import { customAlphabet } from "nanoid";

const keyAlphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const nano = customAlphabet(keyAlphabet, 24);
const tokenNano = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  40
);

/** Public, non-secret key embedded in the widget snippet to scope a tenant. */
export function publicKey(): string {
  return `pk_${nano()}`;
}

/** Long random token for password-reset links. */
export function resetToken(): string {
  return tokenNano();
}

/** URL-safe slug from a business name, with a short random suffix for uniqueness. */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return `${base || "team"}-${nano().slice(0, 5)}`;
}

/** Client-side safe session id for anonymous widget visitors. */
export function sessionId(): string {
  return `sess_${nano()}`;
}
