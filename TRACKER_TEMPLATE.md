# Tracker Template Guide

This guide walks you through customizing the template for your specific game tracker.

---

## What's Included Out of the Box

| Feature                                             | Status      |
| --------------------------------------------------- | ----------- |
| Next.js 16 App Router                               | ✅ Ready    |
| React 19 + TypeScript 5 strict mode                 | ✅ Ready    |
| Tailwind CSS 4 + Flowbite-React                     | ✅ Ready    |
| Dark mode                                           | ✅ Ready    |
| Sidebar navigation                                  | ✅ Ready    |
| Playthrough create / edit / delete                  | ✅ Ready    |
| Playthrough switcher in sidebar                     | ✅ Ready    |
| Playthrough list page with search & sort            | ✅ Ready    |
| Settings page (export / import / reset)             | ✅ Ready    |
| Toast notifications (success, error, info, warning) | ✅ Ready    |
| URL query param service                             | ✅ Ready    |
| SaveFAB (opt-in deferred-save button)               | ✅ Ready    |
| CI (lint + build), Deploy to Vercel workflows       | ✅ Ready    |
| Dependabot dependency updates                       | ✅ Ready    |
| Home / landing page scaffold                        | ✅ Scaffold |

---

## Section 1 — Remove `.keep` Files

The template includes `.keep` files in empty directories so they are tracked by git. Once you add real content to those directories, delete the `.keep` file:

| Directory | `.keep` location | Remove when                                    |
| --------- | ---------------- | ---------------------------------------------- |
| `public/` | `public/.keep`   | You add your first asset (favicon, logo, etc.) |

```bash
# Remove a .keep file once the directory has real content
rm public/.keep
```

---

## Section 2 — Rename the Template

Search for all `CHANGE_ME` and `YOUR_` tokens across the codebase:

```bash
grep -r "CHANGE_ME\|YOUR_APP_NAME\|YOUR_GAME\|YOUR_GAME_NAME" src/
```

Files to update:

| File                                  | What to change                                                   |
| ------------------------------------- | ---------------------------------------------------------------- |
| `package.json`                        | `name`, `description`, `keywords`, `author`                      |
| `src/app/layout.tsx`                  | `metadata.title`, `metadata.description`                         |
| `src/components/layout/AppNavbar.tsx` | Brand name in `<NavbarBrand>`                                    |
| `src/app/(home)/page.tsx`             | `APP_NAME`, `APP_TAGLINE`, `APP_DESCRIPTION`, features list, FAQ |
| `src/app/settings/page.tsx`           | About card text, export filename                                 |
| `src/lib/services/storage.ts`         | `STORAGE_KEY` constant (rename to your app slug)                 |
| `public/`                             | Replace `favicon.ico` and any logo images                        |
| `src/app/site.webmanifest`            | `name`, `short_name`, `theme_color`, icon paths                  |
| `.github/CODEOWNERS`                  | Your GitHub username                                             |
| `.github/CONTRIBUTING.md`             | Repository URL                                                   |
| `.github/FUNDING.yml`                 | Your funding links (or delete the file)                          |

---

## Section 3 — Set Your Theme Colors

Open `src/app/globals.css` and update the `@theme` block with your game's color palette:

```css
@theme {
  --color-primary: #5a9367;
  --color-secondary: #6daedc;
  --color-accent: #8b572a;
  --color-highlight: #f39c12;
}
```

| Variable            | Purpose                                                        | Example usage                  |
| ------------------- | -------------------------------------------------------------- | ------------------------------ |
| `--color-primary`   | Main brand color — buttons, checkboxes, toggles, progress bars | `<Button color="primary">`     |
| `--color-secondary` | Supporting color — secondary actions, badges, alerts           | `<Badge color="secondary">`    |
| `--color-accent`    | Contrast color — callouts, highlights                          | `<Alert color="accent">`       |
| `--color-highlight` | Attention color — warnings, progress, emphasis                 | `<Progress color="highlight">` |

These colors are wired into the Flowbite-React theme (`src/app/theme.ts`) and available on these components:

- **Button** — `color` and `outline` variants
- **Badge**, **Alert**, **Spinner**, **Progress**
- **Checkbox**, **Radio**, **ToggleSwitch**
- **Avatar** (bordered)

Replace the hex values with your own colors. No shade scale (e.g., `-50`, `-100`) is needed — a single value per color is sufficient. Tailwind uses opacity modifiers (e.g., `bg-primary/80`) for hover, focus, and dark mode variants automatically.

---

## Section 4 — Define Your Playthrough Data

The base `Playthrough` interface has a generic `data` field. Replace it with your game's typed state.

**Step 1**: Create `src/types/app/game.d.ts`:

```typescript
// src/types/app/game.d.ts

export interface GameData {
  // Add your game-specific tracking fields here
  completedQuests: string[];
  unlockedItems: Record<string, boolean>;
  level: number;
  // ... add more as needed
}
```

**Step 2**: Update `src/types/app/playthrough.d.ts` to use your typed data:

```typescript
import type { GameData } from "./game";

export interface Playthrough {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastModified: string;
  data: GameData; // Replaced the generic Record<string, unknown>
}
```

**Step 3**: Update `addPlaythrough` in `src/lib/contexts/PlaythroughContext.tsx` to set default initial values:

```typescript
const newPlaythrough: Playthrough = {
  ...playthrough,
  id: crypto.randomUUID(),
  createdAt: now,
  lastModified: now,
  data: {
    completedQuests: [],
    unlockedItems: {},
    level: 1,
  },
};
```

---

## Section 5 — Add Your Game Data

Create your game's static data files in `src/data/[game-name]/` (rename the directory first):

```typescript
// src/data/my-game/quests.ts
export interface Quest {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export const quests: Quest[] = [
  { id: "quest_001", name: "The Beginning", category: "main" },
  { id: "quest_002", name: "Gather Resources", category: "side" },
];

export const getQuestsByCategory = (category: string) =>
  quests.filter((q) => q.category === category);
```

Add corresponding TypeScript types to `src/types/` (a new `game/` subdirectory works well).

---

## Section 6 — Add Tracking Pages

### Pattern A: Active-playthrough pages (recommended)

For most tracker apps, every page works with the currently active playthrough:

```typescript
// src/app/quests/page.tsx
"use client";

import { useMemo, useState } from "react";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { quests } from "@/data/my-game/quests";

export default function QuestsPage() {
  const { activePlaythrough, updatePlaythrough } = usePlaythrough();
  const [searchQuery, setSearchQuery] = useState("");

  if (!activePlaythrough) {
    return <p>Select a playthrough to get started.</p>;
  }

  // Type-assert data to your GameData interface
  const data = activePlaythrough.data as GameData;

  const handleToggleQuest = (questId: string) => {
    const current = data.completedQuests;
    const updated = current.includes(questId)
      ? current.filter((id) => id !== questId)
      : [...current, questId];

    updatePlaythrough(activePlaythrough.id, {
      data: { ...data, completedQuests: updated },
    });
  };

  const filtered = useMemo(
    () => quests.filter((q) => q.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );

  return (
    <div className="p-6">
      <h1>Quests</h1>
      {/* render filtered quest cards */}
    </div>
  );
}
```

### Pattern B: URL-routed per-playthrough pages (dinkum-tracker style)

If you want deep-linkable per-playthrough URLs (`/playthrough/[id]/quests`):

```typescript
// src/app/playthrough/[id]/quests/page.tsx
"use client";

import { useParams } from "next/navigation";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";

export default function QuestsPage() {
  const { id } = useParams<{ id: string }>();
  const { playthroughs, updatePlaythrough } = usePlaythrough();
  const playthrough = playthroughs.find((p) => p.id === id);

  if (!playthrough) return <NotFoundCard />;
  // ... rest of implementation
}
```

### Filter + useMemo pattern

Use `useMemo` for all filtering to avoid re-renders on every keystroke:

```typescript
const filtered = useMemo(() => {
  let result = [...quests];

  if (searchQuery) {
    result = result.filter((q) =>
      q.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  if (filters.category !== "all") {
    result = result.filter((q) => q.category === filters.category);
  }

  return result;
}, [searchQuery, filters]);
```

### URL state for filters

Sync filter state to URL query params so filters persist on refresh:

```typescript
import { getQueryParams, setQueryParam } from "@/service/urlService";

// Read on mount
useEffect(() => {
  const params = getQueryParams();
  if (params.category) setCategory(params.category);
}, []);

// Write on change
const handleCategoryChange = (value: string) => {
  setQueryParam("category", value);
  setCategory(value);
};
```

---

## Section 7 — Update the Sidebar

Open `src/components/layout/sidebar/AppSidebar.tsx` and add your game-specific nav items inside the `{activePlaythrough && (...)}` block:

```typescript
import { HiClipboardList, HiChartPie } from "react-icons/hi";

{activePlaythrough && (
  <>
    <SidebarItem
      as={Link}
      href="/dashboard"
      icon={HiChartPie}
      active={pathname === "/dashboard"}
      onClick={() => setSidebarOpen(false)}
    >
      Dashboard
    </SidebarItem>
    <SidebarItem
      as={Link}
      href="/quests"
      icon={HiClipboardList}
      active={pathname === "/quests"}
      onClick={() => setSidebarOpen(false)}
    >
      Quests
    </SidebarItem>
  </>
)}
```

---

## Section 8 — Add a Dashboard

Create a dashboard page that shows progress stats using the active playthrough's data:

```typescript
// src/app/dashboard/page.tsx
"use client";

import { Card } from "flowbite-react";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { quests } from "@/data/my-game/quests";

export default function Dashboard() {
  const { activePlaythrough } = usePlaythrough();

  if (!activePlaythrough) {
    return <p className="p-6">Select a playthrough to see your dashboard.</p>;
  }

  const data = activePlaythrough.data as GameData;
  const completedCount = data.completedQuests.length;
  const totalCount = quests.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="p-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quests</h3>
        <p className="text-3xl font-bold">{completedCount} / {totalCount}</p>
        <p className="text-gray-500">{percentage}% complete</p>
      </Card>
    </div>
  );
}
```

---

## Section 9 — SaveFAB (Optional Deferred-Save Pattern)

If your tracking pages have lots of checkboxes and you want to batch saves, use the `SaveFAB` component:

```typescript
"use client";

import { useState } from "react";
import SaveFAB from "@/playthrough/SaveFAB";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";

export default function QuestsPage() {
  const { activePlaythrough, updatePlaythrough } = usePlaythrough();
  const [localData, setLocalData] = useState(activePlaythrough?.data ?? {});
  const [isDirty, setIsDirty] = useState(false);

  const handleToggle = (questId: string) => {
    setLocalData((prev) => ({ ...prev, /* update */ }));
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!activePlaythrough) return false;
    updatePlaythrough(activePlaythrough.id, { data: localData });
    setIsDirty(false);
    return true;
  };

  return (
    <div className="p-6">
      {/* quest cards */}
      <SaveFAB isDirty={isDirty} onSave={handleSave} />
    </div>
  );
}
```

---

## Section 10 — Settings Page Customization

The settings page is fully functional. To add game-specific preferences (e.g., default sort order, display options), add a second `Card` to `src/app/settings/page.tsx`:

```tsx
<Card>
  <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
    Preferences
  </h2>
  <div className="space-y-4">
    <div>
      <Label>Default Sort</Label>
      <Select>
        <option value="name">Name</option>
        <option value="completion">Completion</option>
      </Select>
    </div>
  </div>
</Card>
```

Store preferences in `localStorage` independently from playthrough data (a separate key).

---

## Section 11 — Deploy to Vercel

The `deploy.yml` workflow is ready. Set these GitHub Actions secrets in your repository settings:

| Secret              | Where to find it                                   |
| ------------------- | -------------------------------------------------- |
| `VERCEL_TOKEN`      | Vercel → Account Settings → Tokens                 |
| `VERCEL_ORG_ID`     | `.vercel/project.json` after running `vercel link` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` after running `vercel link` |

Then trigger the workflow manually from GitHub Actions → Deploy → Run workflow.

---

## Section 12 — Extending Later

**Adding new fields to an existing playthrough**: Update your `GameData` interface and add the new field to the `createEmptyPlaythrough` factory. The `data: Record<string, unknown>` base type is compatible — just update your type assertion in page components.

**Adding a breadcrumb**: Install a breadcrumb component or build one using the current `usePathname()` hook. Structure it as a simple `nav > ol > li` pattern with Flowbite's `Breadcrumb` component.

**Using `urlService` for filter state**: See Section 4 above. The service is at `@/service/urlService`.

**Multiple context consumers on one page**: All context hooks (`usePlaythrough`, `useUI`) can be used in any client component within the provider tree. The providers are set up in `src/app/layout.tsx`.
