import coreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...coreWebVitals,
  {
    rules: {
      "@next/next/no-img-element": "off",
      "func-style": ["error", "expression"],
      "prefer-arrow-callback": "error",
    },
  },
  {
    // Ban inline interface/type declarations in component and page files.
    // All types must live in src/types/ per CLAUDE.md.
    files: ["src/components/**/*.{ts,tsx}", "src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSInterfaceDeclaration",
          message: "Move this interface to src/types/ — interfaces must not be defined in component or page files.",
        },
        {
          selector: "TSTypeAliasDeclaration",
          message: "Move this type to src/types/ — type aliases must not be defined in component or page files.",
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/",
      ".next/",
      "out/",
      "public/",
      "*.config.js",
      "*.config.mjs",
      ".flowbite-react/",
      "dist/",
    ],
  },
];

export default config;
