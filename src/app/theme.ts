import { createTheme } from "flowbite-react";
import type { CustomFlowbiteTheme } from "flowbite-react/types";

export const customTheme: CustomFlowbiteTheme = createTheme({
  button: {
    base: "cursor-pointer",
    color: {
      primary:
        "bg-primary hover:bg-primary/80 focus:ring-primary/50 dark:bg-primary dark:hover:bg-primary/80 dark:focus:ring-primary/30 text-white",
      secondary:
        "bg-secondary hover:bg-secondary/80 focus:ring-secondary/50 dark:bg-secondary dark:hover:bg-secondary/80 dark:focus:ring-secondary/30 text-white",
      accent:
        "bg-accent hover:bg-accent/80 focus:ring-accent/50 dark:bg-accent dark:hover:bg-accent/80 dark:focus:ring-accent/30 text-white",
      highlight:
        "bg-highlight hover:bg-highlight/80 focus:ring-highlight/50 dark:bg-highlight dark:hover:bg-highlight/80 dark:focus:ring-highlight/30 text-white",
    },
    outlineColor: {
      primary:
        "border-primary text-primary hover:border-primary/80 hover:bg-primary focus:ring-primary/50 dark:border-primary dark:text-primary dark:hover:bg-primary dark:focus:ring-primary/30 border hover:text-white dark:hover:text-white",
      secondary:
        "border-secondary text-secondary hover:border-secondary/80 hover:bg-secondary focus:ring-secondary/50 dark:border-secondary dark:text-secondary dark:hover:bg-secondary dark:focus:ring-secondary/30 border hover:text-white dark:hover:text-white",
      accent:
        "border-accent text-accent hover:border-accent/80 hover:bg-accent focus:ring-accent/50 dark:border-accent dark:text-accent dark:hover:bg-accent dark:focus:ring-accent/30 border hover:text-white dark:hover:text-white",
      highlight:
        "border-highlight text-highlight hover:border-highlight/80 hover:bg-highlight focus:ring-highlight/50 dark:border-highlight dark:text-highlight dark:hover:bg-highlight dark:focus:ring-highlight/30 border hover:text-white dark:hover:text-white",
    },
  },
  badge: {
    root: {
      color: {
        primary:
          "bg-primary/20 text-primary hover:bg-primary/30 dark:bg-primary/30 dark:text-primary dark:hover:bg-primary/40",
        secondary:
          "bg-secondary/20 text-secondary hover:bg-secondary/30 dark:bg-secondary/30 dark:text-secondary dark:hover:bg-secondary/40",
        accent:
          "bg-accent/20 text-accent hover:bg-accent/30 dark:bg-accent/30 dark:text-accent dark:hover:bg-accent/40",
        highlight:
          "bg-highlight/20 text-highlight hover:bg-highlight/30 dark:bg-highlight/30 dark:text-highlight dark:hover:bg-highlight/40",
      },
    },
  },
  alert: {
    color: {
      primary:
        "border-primary bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary",
      secondary:
        "border-secondary bg-secondary/15 text-secondary dark:bg-secondary/25 dark:text-secondary",
      accent:
        "border-accent bg-accent/15 text-accent dark:bg-accent/25 dark:text-accent",
      highlight:
        "border-highlight bg-highlight/15 text-highlight dark:bg-highlight/25 dark:text-highlight",
    },
    closeButton: {
      color: {
        primary:
          "bg-primary/15 text-primary hover:bg-primary/25 focus:ring-primary dark:bg-primary/25 dark:text-primary dark:hover:bg-primary/35",
        secondary:
          "bg-secondary/15 text-secondary hover:bg-secondary/25 focus:ring-secondary dark:bg-secondary/25 dark:text-secondary dark:hover:bg-secondary/35",
        accent:
          "bg-accent/15 text-accent hover:bg-accent/25 focus:ring-accent dark:bg-accent/25 dark:text-accent dark:hover:bg-accent/35",
        highlight:
          "bg-highlight/15 text-highlight hover:bg-highlight/25 focus:ring-highlight dark:bg-highlight/25 dark:text-highlight dark:hover:bg-highlight/35",
      },
    },
  },
  spinner: {
    color: {
      primary: "fill-primary",
      secondary: "fill-secondary",
      accent: "fill-accent",
      highlight: "fill-highlight",
    },
  },
  progress: {
    color: {
      primary: "bg-primary",
      secondary: "bg-secondary",
      accent: "bg-accent",
      highlight: "bg-highlight",
    },
  },
  checkbox: {
    color: {
      primary:
        "text-primary focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800",
      secondary:
        "text-secondary focus:ring-secondary dark:focus:ring-secondary dark:ring-offset-gray-800",
      accent:
        "text-accent focus:ring-accent dark:focus:ring-accent dark:ring-offset-gray-800",
      highlight:
        "text-highlight focus:ring-highlight dark:focus:ring-highlight dark:ring-offset-gray-800",
    },
  },
  toggleSwitch: {
    toggle: {
      checked: {
        color: {
          primary:
            "bg-primary group-focus:ring-primary/50 dark:group-focus:ring-primary/30",
          secondary:
            "bg-secondary group-focus:ring-secondary/50 dark:group-focus:ring-secondary/30",
          accent:
            "bg-accent group-focus:ring-accent/50 dark:group-focus:ring-accent/30",
          highlight:
            "bg-highlight group-focus:ring-highlight/50 dark:group-focus:ring-highlight/30",
        },
      },
    },
  },
  radio: {
    color: {
      primary:
        "text-primary focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800",
      secondary:
        "text-secondary focus:ring-secondary dark:focus:ring-secondary dark:ring-offset-gray-800",
      accent:
        "text-accent focus:ring-accent dark:focus:ring-accent dark:ring-offset-gray-800",
      highlight:
        "text-highlight focus:ring-highlight dark:focus:ring-highlight dark:ring-offset-gray-800",
    },
  },
  avatar: {
    root: {
      color: {
        primary: "ring-primary dark:ring-primary",
        secondary: "ring-secondary dark:ring-secondary",
        accent: "ring-accent dark:ring-accent",
        highlight: "ring-highlight dark:ring-highlight",
      },
    },
  },
  dropdown: {
    inlineWrapper: "cursor-pointer",
  },
  modal: {
    header: {
      close: {
        base: "cursor-pointer",
      },
    },
  },
  select: {
    field: {
      select: {
        base: "cursor-pointer",
      },
    },
  },
  sidebar: {
    item: {
      base: "cursor-pointer text-sm",
    },
  },
  tabs: {
    tablist: {
      tabitem: {
        base: "cursor-pointer",
      },
    },
  },
});
