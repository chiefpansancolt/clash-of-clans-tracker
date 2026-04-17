export const massEditTabsTheme = {
  base: "flex flex-col h-full overflow-hidden",
  tablist: {
    base: "shrink-0 flex flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-secondary/80 bg-highlight px-4 py-3",
    variant: {
      pills: "gap-1",
    },
    tabitem: {
      base: "shrink-0 flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold first:ml-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40",
      variant: {
        pills: {
          base: "",
          active: {
            on: "bg-primary text-white",
            off: "bg-secondary/10 text-gray-900 hover:bg-secondary/20",
          },
        },
      },
    },
  },
  tabitemcontainer: {
    base: "flex-1 overflow-y-auto px-4",
    variant: { pills: "" },
  },
  tabpanel: "py-4",
};
