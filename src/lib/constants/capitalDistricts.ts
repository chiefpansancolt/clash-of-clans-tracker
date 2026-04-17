export const DISTRICTS = [
  { id: "barbarianCamp",    label: "Barbarian Camp",     key: "barbarianCamp"    },
  { id: "wizardValley",     label: "Wizard Valley",      key: "wizardValley"     },
  { id: "balloonLagoon",    label: "Balloon Lagoon",     key: "balloonLagoon"    },
  { id: "buildersWorkshop", label: "Builder's Workshop", key: "buildersWorkshop" },
  { id: "dragonCliffs",     label: "Dragon Cliffs",      key: "dragonCliffs"     },
  { id: "golemQuarry",      label: "Golem Quarry",       key: "golemQuarry"      },
  { id: "skeletonPark",     label: "Skeleton Park",      key: "skeletonPark"     },
  { id: "goblinMines",      label: "Goblin Mines",       key: "goblinMines"      },
] as const;

export type DistrictKey = (typeof DISTRICTS)[number]["key"];
