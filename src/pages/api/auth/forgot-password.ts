export const prerender = false;
import type { APIRoute } from "astro";
import { setFlash } from "../../../lib/flash";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();

  if (!email) {
    setFlash(cookies, "error", "Please enter your email address");

    return redirect("/forgot-password");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://rethree.online/reset-password",
  });

  if (error) {
    setFlash(cookies, "error", "Error sending password reset email. Please try again.");

    return redirect("/forgot-password");
  }

  setFlash(cookies, "success", "Password reset email sent! Please check your inbox.");

  return redirect("/forgot-password");
};
