export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import { setFlash } from "../../../lib/flash";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const password = formData.get("password")?.toString();
  const confirm_password = formData.get("confirm_password")?.toString();

  if (password != confirm_password) {
    setFlash(cookies, "error", "Passwords don't match");
    return redirect("/dashboard/settings");
  }

  const { error: updateError } =
    await supabase.auth.updateUser({
      password: password,
    });

  if (updateError) {
    setFlash(cookies, "error", "Failed to update password. Please try again.");
    return redirect("/dashboard/settings");
  }

  setFlash(cookies, "success", "Password updated successfully.");
  return redirect("/dashboard/settings");
};
