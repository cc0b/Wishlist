# Wishlist — Social Gift Coordination Platform

A Next.js 14 + Supabase app where friends create wishlists and coordinate gifts together. No more guessing, no more duplicate presents.

## What's included in this starter

- **Auth**: Google & Apple OAuth via Supabase Auth (with middleware-protected routes)
- **Wishlists**: Create, edit (inline title editing), and delete wishlists
- **Items**: Add items with name, link, price (NZD), and notes. Edit inline. Delete.
- **UI**: Clean design system with Tailwind CSS, Framer Motion animations, and Lucide icons
- **Database**: Full Supabase migration with RLS policies, auto-profile creation trigger, and indexes

## Tech stack

| Layer       | Tool                                      |
| ----------- | ----------------------------------------- |
| Framework   | Next.js 14 (App Router, Server Components)|
| Styling     | Tailwind CSS + DM Sans / Instrument Serif |
| Animation   | Framer Motion                             |
| Backend/DB  | Supabase (PostgreSQL, Auth, RLS)          |
| Auth        | Supabase Auth (Google + Apple OAuth)      |
| Deployment  | Vercel                                    |
| Package mgr | pnpm                                      |

## Getting started

### 1. Clone and install

```bash
git clone <your-repo-url> wishlist
cd wishlist
pnpm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/migration.sql`
3. Copy your project URL and anon key from **Settings > API**

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set up OAuth providers

**Google:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add `https://your-project.supabase.co/auth/v1/callback` as an authorised redirect URI
4. In Supabase Dashboard → Authentication → Providers → Google, paste your Client ID and Secret

**Apple:**
1. Go to [Apple Developer](https://developer.apple.com/) → Certificates, Identifiers & Profiles
2. Create a Services ID and configure Sign In with Apple
3. Add `https://your-project.supabase.co/auth/v1/callback` as a redirect URL
4. In Supabase Dashboard → Authentication → Providers → Apple, paste your credentials

### 5. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
wishlist/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx        # OAuth login page
│   │   └── callback/route.ts     # OAuth callback handler
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Sidebar + auth guard
│   │   ├── wishlists/
│   │   │   ├── page.tsx          # Wishlist grid (dashboard home)
│   │   │   └── [id]/page.tsx     # Wishlist detail + items
│   ├── globals.css               # Tailwind + component classes
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── sidebar.tsx               # Dashboard sidebar nav
│   ├── create-wishlist-button.tsx# Modal to create wishlist
│   ├── wishlist-grid.tsx         # Wishlist cards with delete
│   ├── edit-wishlist-title.tsx   # Inline title/desc editing
│   ├── add-item-form.tsx         # Expandable item form
│   └── item-list.tsx             # Item cards with edit/delete
├── lib/
│   ├── supabase-client.ts        # Browser Supabase client
│   └── supabase-server.ts        # Server Supabase client
├── types/
│   └── database.ts               # TypeScript interfaces
├── supabase/
│   └── migration.sql             # DB schema + RLS policies
├── middleware.ts                  # Auth session refresh + redirects
└── .env.local.example            # Environment template
```

## What's next (from the PRD)

Per the sprint plan, the next features to build are:

- **Week 3**: Friends system (send/accept/decline requests) + Events (create, invite friends)
- **Week 4**: Shared wishlist viewing + Claim/co-claim system + Surprise mode + Drag-and-drop (@dnd-kit)
- **Week 5**: Polish, deploy to Vercel, demo mode stub

## Deploying to Vercel

```bash
pnpm build
vercel --prod
```

Add your environment variables in the Vercel dashboard under Settings → Environment Variables.
