import { createAuthClient } from "better-auth/react";

const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");

/**
 * Point `NEXT_PUBLIC_APP_URL` at the same origin you use in the browser (e.g.
 * `http://localhost:3000` in dev). If it targets another host, sign-in / sign-out
 * requests go to the wrong place while the rest of the app is on this origin.
 */
export const authClient = createAuthClient(
  publicAppUrl ? { baseURL: publicAppUrl } : {},
);
