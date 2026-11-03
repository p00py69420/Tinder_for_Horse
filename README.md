# AduuMatch

A Next.js application for Mongolian horse records, pedigrees, and breeding discovery.

## Requirements

- Node.js 20.9 or newer
- npm
- A Supabase project for authentication and persistent data

## Environment variables

Set these in `.env.local` for local development and in the Vercel project's **Environment Variables** settings for deployment:

| Name | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |

The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also accepted instead of `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Do not use a Supabase service-role key in the browser or in a `NEXT_PUBLIC_` variable.

For local development, copy `.env.example` to `.env.local` and fill in the values from the Supabase project settings. `.env.local` is ignored by Git.

## Local development

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks and production build

```sh
npm run typecheck
npm test
npm run build
npm start
```

There is no lint script configured in `package.json`.

## Deploying to Vercel

Import this repository as a Next.js project. The default build command is `npm run build`; no custom output directory is needed. Add the required Supabase environment variables above in the Vercel project settings for each deployment environment, then redeploy after changing them.

In Supabase Authentication URL Configuration, set the site URL to the deployed site and allow its `/auth/callback` and `/auth/confirm` routes. Apply the SQL files in `supabase/migrations/` in filename order to the intended Supabase project, and confirm each migration succeeds before using the app. Migrations are not run automatically by Vercel.
