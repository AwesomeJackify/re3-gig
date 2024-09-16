import { supabase_admin } from "../../../lib/supabase_admin";

const { data: user, error: adminError } =
  await supabase_admin.auth.admin.updateUserById(
    "c05f310a-0800-4fcc-a0a7-60943a0aaab8",
    {
      user_metadata: {
        first_name: "Tim",
        last_name: "Max",
      },
    }
  );

console.log(user, adminError);
