/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly CLOUDINARY_CLOUD_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Task {
  id: string;
  name: string;
  is_complete: boolean;
  created_at: string;
}

interface Journal {
  id: string;
  user_id: string;
  journal_entry: string;
  created_at: string;
}