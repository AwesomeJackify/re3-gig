export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();

  if (!email) {
    return redirect("/login?error=Email is required");
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: "https://rethree.online/login-otp",
    },
  });

  if (error) {
    return redirect("/login?error=" + "Error logging in");
  }

  return redirect("/login?success=Password reset email sent");
};
