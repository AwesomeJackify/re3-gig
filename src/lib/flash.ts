import type { AstroCookies } from "astro";

type FlashType = "success" | "error" | "info";

export function setFlash(
  cookies: AstroCookies,
  type: FlashType,
  message: string
) {
  cookies.set(
    "flash",
    JSON.stringify({
      type,
      message,
    }),
    {
      path: "/",
      maxAge: 10,
    }
  );
}