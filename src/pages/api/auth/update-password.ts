export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const password = formData.get("password")?.toString();
  const confirm_password = formData.get("confirm_password")?.toString();

  if (password != confirm_password) {
    return redirect("/dashboard/settings?error=Passwords don't match");
  }

  const { data: updateData, error: updateError } =
    await supabase.auth.updateUser({
      password: password,
    });

  if (updateError) {
    return redirect("/dashboard/settings?error=Password update failed");
  }

  return redirect("/dashboard/settings?status=Password updated");
};
