# tracker-template

A Next.js template for building game progress tracker apps. Provides the full shared infrastructure used by [dinkum-tracker](https://github.com/chiefpansancolt/dinkum-tracker) and [supermarket-simulator-buddy](https://github.com/chiefpansancolt/supermarket-simulator-buddy).

## Features

- **Playthrough management** — create, edit, delete, switch between playthroughs
- **localStorage persistence** — all data stored locally, no backend required
- **Import / Export / Reset** — full data management in the settings page
- **Dark mode** — Flowbite-React theme with dark mode toggle
- **Sidebar navigation** — collapsible sidebar with playthrough switcher
- **Toast notifications** — success, error, info, warning helpers
- **URL state service** — sync filter state to query params
- **SaveFAB** — optional floating save button for deferred-save pages
- **CI/CD** — GitHub Actions workflows for lint + build and Vercel deployment
- **Dependabot** — automated dependency updates with grouped PRs

## Tech Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript 5** (strict)
- **Tailwind CSS 4** · **Flowbite-React**
- **react-toastify** · **react-icons**
- **pnpm** · **Node >= 24**

## Getting Started

```bash
# Use this template (GitHub) or clone manually
git clone https://github.com/your-username/tracker-template.git my-tracker
cd my-tracker
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Customising

See [TRACKER_TEMPLATE.md](./TRACKER_TEMPLATE.md) for the full step-by-step guide:

1. Rename `YOUR_APP_NAME` / `YOUR_GAME` tokens
2. Define your `GameData` type
3. Add game data files in `src/data/[game-name]/`
4. Add tracking pages
5. Update the sidebar
6. Deploy to Vercel

## Development

```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Production build
pnpm lint         # ESLint
pnpm format       # Prettier
```

## License

MIT
