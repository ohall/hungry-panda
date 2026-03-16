# AGENTS.md — Hungry Panda

A mobile-first meal planning app for families. Built with SvelteKit, TypeScript, and Supabase.

## Project Context

**App Name:** Hungry Panda  
**Purpose:** Help families plan weekly meals, generate shopping lists, and save favorite recipes.  
**Target Users:** Busy families who want simple meal planning on their phones.

## Tech Stack

- **Framework:** SvelteKit 2.x with Svelte 5 (runes mode)
- **Language:** TypeScript (strict mode)
- **Styling:** CSS (see `src/app.css`)
- **Backend/DB:** Supabase (client SDK installed)
- **API:** Spoonacular (for recipes - future integration)
- **Deployment:** Vercel (adapter configured)

## Project Structure

```
src/
├── lib/           # Shared components, utilities, stores
├── routes/        # SvelteKit routes (+page.svelte, +layout.svelte)
├── app.css        # Global styles
├── app.d.ts       # TypeScript declarations
└── app.html       # HTML template
```

## Development Commands

```bash
npm install     # Install dependencies
npm run dev     # Start dev server (Vite)
npm run build   # Production build
npm run preview # Preview production build
```

## Key Decisions

- **Mobile-first:** Design for phones first, scale up
- **Simplicity:** Keep UI minimal and fast
- **No auth yet:** Open to adding Supabase Auth later
- **Node 20.x:** Locked engine version

## Environment Variables

Copy `.env.example` to `.env` and fill in:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Future Plans

- Weekly meal suggestions
- Shopping list generation
- Recipe favorites
- ShopRite cart integration

## Workflow (CRITICAL)

**Always pull latest changes before working:**
```bash
git pull origin master
```

Oakley modifies this repo from multiple locations. Starting work without pulling first = merge conflicts and sadness.

## Agent Notes

- Use Svelte 5 runes (`$state`, `$derived`, `$effect`) — not legacy reactive statements
- Keep components small and focused
- Prefer TypeScript strictness — avoid `any`
- Test on mobile viewport during dev
- Ask before adding new major dependencies
