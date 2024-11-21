// With `output: 'hybrid'` configured:
export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const fname = formData.get("fname")?.toString();
  const lname = formData.get("lname")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password || !fname || !lname) {
    return redirect("/register12345?error=Please fill out all fields");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: fname,
        last_name: lname,
      },
      emailRedirectTo: "https://rethree.online/login",
    },
  });

  if (error) {
    return redirect("/login?error=" + error.message);
  }

  return redirect("/login?success=Account created. Please verify your email.");
};
