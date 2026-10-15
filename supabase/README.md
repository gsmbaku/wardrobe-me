Supabase setup (Postgres, Auth, Storage)

1. Create a Supabase project and copy your Project URL and anon public key.
2. In Vercel (and local .env), set:
   - VITE_SUPABASE_URL=your-project-url
   - VITE_SUPABASE_ANON_KEY=your-anon-key
3. Run the SQL migrations in order in the Supabase SQL editor:
   - supabase/migrations/0001_items.sql
   - supabase/migrations/0002_storage.sql
4. In Authentication → Providers, ensure Email/Password is enabled.
5. Optional: Set Auth email confirmation to "Secure" (users must confirm email) or "Off" in development.
6. Deploy the app; sign up from the Settings → Account panel. Items you add while signed in will persist to your Supabase project and sync across devices.

Design notes
- Items table uses RLS by `user_id = auth.uid()`.
- Storage objects are private; users can only access paths under `${uid}/...`.
- Image uploads save two files: `${uid}/${imageId}.jpg` and `${uid}/thumb_${imageId}.jpg`.
- The app continues to work locally when signed out; a one‑time importer offers to upload your existing local items after sign‑in.

