import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const { data: user, error: adminError } =
  await supabase.auth.admin.updateUserById(
    "ec18a17c-0d47-4559-8c38-45ebd476ef3b",
    {
      user_metadata: {
        first_name: "Tim1",
        last_name: "Max",
      },
    }
  );

console.log(user, adminError);
