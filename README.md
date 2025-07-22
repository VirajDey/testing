# Test-backend: Cloudflare Worker CRUD API (Users) with Supabase

This project is a simple backend for user management (name, email, phone) using Cloudflare Workers and Supabase (PostgreSQL).

## Features
- CRUD operations for `users`
- Deployable to Cloudflare Workers
- Uses Supabase REST API (HTTP-based)

## Setup

1. **Clone this repo**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Supabase:**
   - Create a Supabase project at https://supabase.com/ (if you haven't already).
   - Create a `users` table with columns:
     - `id` (uuid, primary key, default value: uuid_generate_v4())
     - `name` (text)
     - `email` (text)
     - `phone` (text)
   - Get your Supabase project URL and anon key from your Supabase dashboard (Settings → API).
   - Edit `wrangler.toml` and replace the placeholders:
     ```toml
     [vars]
     SUPABASE_URL = "https://uicyksyhbzywahcltznv.supabase.co"
     SUPABASE_ANON_KEY = "<your-supabase-anon-key>"
     ```

## Local Development

Cloudflare Workers run in a special environment. To test locally:

```bash
npx wrangler dev
```

## Deploy to Cloudflare

```bash
npx wrangler publish
```

## API Endpoints

- `POST   /users`         – Create user
- `GET    /users`         – List all users
- `GET    /users/:id`     – Get user by ID
- `PUT    /users/:id`     – Update user
- `DELETE /users/:id`     – Delete user

## Notes
- This project uses the Supabase REST API for compatibility with Cloudflare Workers.
- All secrets are managed via Wrangler environment variables. 

---

## 1. Open Supabase SQL Editor

- Go to your Supabase project dashboard.
- In the left sidebar, click on **“SQL Editor”**.

---

## 2. Run the Table Creation SQL

Paste and run the following SQL to create your `users` table:

```sql
create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text
);
```

---

## 3. (Optional) Enable Row Level Security (RLS)

If you want to use the anon key for public access, you need to enable RLS and add a policy.  
For development/testing, you can allow all access:

```sql
alter table users enable row level security;

create policy "Allow all" on users
  for all
  using (true);
```

> **Note:** For production, you should restrict these policies!

---

## 4. Save and Run

- Click **“Run”** to execute the SQL.
- Your `users` table is now ready for use with your Cloudflare Worker backend!

---

### You’re Ready!

You can now use your API endpoints (`/users`, etc.) as described in the README.

If you want, I can provide test curl commands or a sample request to verify your setup. Just let me know! 