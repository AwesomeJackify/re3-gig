export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import { setFlash } from "../../../lib/flash";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const password = formData.get("password")?.toString();
  const confirm_password = formData.get("confirm_password")?.toString();

  const access_token = formData.get("access_token")?.toString();
  const refresh_token = formData.get("refresh_token")?.toString();

  if (!password || !confirm_password || password !== confirm_password) {
    setFlash(cookies, "error", "All fields are required and passwords must match.");
    return redirect("/reset-password");
  }

  if (!access_token || !refresh_token) {
    setFlash(cookies, "error", "Invalid or missing tokens. Please try resetting your password again.");
    return redirect("/forgot-password");
  }

  await supabase.auth.setSession({
    access_token,
    refresh_token
  });

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    setFlash(cookies, "error", "Error resetting password. Please try again.");
    return redirect("/reset-password");
  }

  setFlash(cookies, "success", "Password reset successfully.");
  return redirect("/login");
};
