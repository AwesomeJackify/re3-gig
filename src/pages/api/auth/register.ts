export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import { setFlash } from "../../../lib/flash";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const fname = formData.get("fname")?.toString();
  const lname = formData.get("lname")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirm_password")?.toString();

  if (!email || !password || !fname || !lname || !confirmPassword) {
    setFlash(cookies, "error", "Please fill out all fields");
    return redirect("/register");
  }

  if (password !== confirmPassword) {
    setFlash(cookies, "error", "Passwords do not match");
    return redirect("/register");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: fname,
        last_name: lname,
      },
      emailRedirectTo: `https://rethree.online/login`
    },
  });

  if (error) {
    setFlash(cookies, "error", error.message);
    return redirect("/register");
  }

  setFlash(cookies, "success", "Account created. Please verify your email.");
  return redirect("/login");
};
