// With `output: 'hybrid'` configured:
export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();

  if (!email) {
    return redirect("/forgot-password?error=Please fill out email");
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: import.meta.env.PROD
        ? "http://rethree.online/login-otp"
        : "http://localhost:4321/login-otp",
      shouldCreateUser: false,
    },
  });

  if (error) {
    return redirect("/forgot-password?error=" + error.message);
  }

  return redirect("/login?success=One Time Password sent to your email");
};
