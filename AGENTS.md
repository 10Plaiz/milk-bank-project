# Repository Guidelines

## Project Structure & Module Organization

This is a Vite React frontend. The app entry point is `src/main.tsx`, with the main application shell in `src/app/App.tsx`. Feature and layout code lives in `src/app/components`, grouped into `screens`, `shared`, `ui`, and Figma-derived components. Shared types and local data are in `src/app/types.ts` and `src/app/mockData.ts`; Supabase setup is in `src/lib/supabase.ts`. Global styling is split across `src/styles`, including Tailwind, theme, fonts, and global CSS. Reference materials and imported product docs are kept in `src/imports`. Build output is generated into `dist` and should not be edited directly.

## Build, Test, and Development Commands

- `npm i`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server for local work.
- `npm run build`: create a production build in `dist`.

There is currently no configured test or lint script in `package.json`. Add scripts there before documenting or relying on commands such as `npm test` or `npm run lint`.

## Coding Style & Naming Conventions

Use TypeScript and React functional components. Keep component filenames in PascalCase, such as `Layout.tsx`, and keep utility modules in camelCase, such as `exportUtils.ts`. Prefer colocating screen-specific UI under `src/app/components/screens` and reusable primitives under `src/app/components/shared` or `src/app/components/ui`. Follow the existing CSS organization instead of adding one-off global styles. Use two-space indentation in JSON and keep imports organized by external libraries first, then local modules.

## Testing Guidelines

No testing framework is currently configured. When adding tests, choose a Vite-compatible setup such as Vitest plus React Testing Library, add the command to `package.json`, and place tests near the code they cover using names like `ComponentName.test.tsx`. Prioritize coverage for form behavior, navigation flows, Supabase interactions, and exported utilities.

## Commit & Pull Request Guidelines

Recent commits use short, plain summaries such as `Fixed overall UI` and `sql`. Keep commit messages concise but more descriptive when possible, for example `Fix dashboard donor table spacing`. Pull requests should include a short description, linked issue or task when available, screenshots for UI changes, and notes about any new environment variables, migrations, or manual verification steps. Confirm `npm run build` passes before requesting review.

## Security & Configuration Tips

Do not commit secrets or local Supabase credentials. Keep environment-specific values in ignored local env files and document required variable names in the PR when they change.
