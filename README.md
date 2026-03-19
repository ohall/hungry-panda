# Hungry Panda

A mobile-first meal planning app for families.

## Current Features

- Weekly meal planner with day-by-day meal assignment
- Recipe suggestion pipeline that merges:
  - OpenRouter-generated meal ideas
  - saved Supabase recipes that have not been planned recently
- Background prefetching of recipe suggestions on page load for a faster planner modal
- Recipe feedback controls to favorite or dislike suggestions
- Settings screen for default recipe-prompt ingredients and constraints

## Environment Variables

Copy `.env.example` to `.env` and provide:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_APP_URL=http://localhost:5173
OPENROUTER_APP_NAME=Hungry Panda
```

If OpenRouter or Supabase are not configured, the app falls back to seeded server-side data so the UI still works locally.

## Supabase Schema

Apply `supabase/schema.sql` to create the initial tables:

- `prompt_settings`
- `recipes`
- `meal_assignments`

## Development

```bash
npm install
npm run dev
```
