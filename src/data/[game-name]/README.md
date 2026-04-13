# Game Data Directory

Rename this directory to match your game (e.g., `my-game/`).

Add your game's static data files here as TypeScript arrays/objects.

## Example structure

```
src/data/my-game/
├── items.ts          # export const items: Item[] = [...]
├── quests.ts         # export const quests: Quest[] = [...]
└── constants.ts      # game-specific constants
```

## Example data file

```typescript
// src/data/my-game/items.ts
import type { Item } from "@/types";

export const items: Item[] = [
  { id: "item_001", name: "Iron Sword", category: "weapon", rarity: "common" },
  { id: "item_002", name: "Fire Staff", category: "weapon", rarity: "rare" },
];

export const getItemById = (id: string) => items.find((i) => i.id === id);
export const getItemsByCategory = (category: string) =>
  items.filter((i) => i.category === category);
```

See `TRACKER_TEMPLATE.md` for full guidance on adding game data.
