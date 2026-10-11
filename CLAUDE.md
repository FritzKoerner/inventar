# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Inventar" is a web app for managing the equipment of a canteen kitchen — an inventory /
asset management tool. Its main goals are **simplicity and usability**: prefer fewer screens,
fewer fields, and obvious flows over feature breadth.

Planned scope:

- **Items** — users can add, remove, and view them. An item has: name, amount, description,
  location (where to find it), category, picture, and a status (e.g. broken, currently
  rented out).
- **Rental lists** — users can record when items are rented out: which items, the dates, and
  who took them.

Current state: only the read-only overview table exists (name, amount, description, location,
category, plus a text search). Picture, status, adding/removing items, and rentals are not
implemented yet. The nav entry "Hinzufügen" is a placeholder without a route.

This repo is the Angular 21 frontend only. The backend is a separate PocketBase instance
expected at `http://127.0.0.1:8090/` (hardcoded in `src/app/services/pocketbase.service.ts`);
it is not part of this repo and must be running for the app to show data. UI text is German.

## Commands

```bash
npm start                                          # ng serve, dev config, http://localhost:4200
npm run build                                      # production build -> dist/
npm test                                           # Vitest via @angular/build:unit-test (watch mode)
npx ng test --watch=false                          # single run
npx ng test --watch=false --include src/app/app.spec.ts   # one spec file
```

No linter is configured. Formatting follows the Prettier settings in `package.json`
(100 cols, single quotes, Angular parser for `.html`).

Known state: the `should render title` test in `src/app/app.spec.ts` fails — it still expects
the CLI scaffold heading `Hello, inventarFrontend`, while the template renders `Inventar`.

## Environments and credentials

- `src/environments/environment.ts` (committed, `production: true`, empty credentials) is the
  default. The development build/serve config swaps in
  `src/environments/environment.development.ts` via `fileReplacements` in `angular.json`.
- `environment.development.ts` holds PocketBase superuser credentials and is **gitignored** —
  never commit it. A fresh clone has to create it with the same shape
  (`production`, `pocketbaseSuperuser`, `pocketbasePassword`) or `ng serve` fails.
- `production` selects the auth collection: `users` in production, `_superusers` in dev.

## Styling

Follow `STYLEGUIDE.md` for any UI or CSS change (tokens, borders, spacing, component recipes).

## Architecture

- Standalone-component app, no NgModules. Bootstrap in `src/main.ts` with `appConfig`
  (`src/app/app.config.ts`); `app.routes.ts` is empty, so everything currently lives in the
  root `App` component (`src/app/app.ts` / `app.html` / `app.css`).
- Templates use the new control flow (`@for` … `track`) and signals (`inventory` is a
  `signal<RecordModel[]>`).
- `PocketbaseService` creates a new PocketBase client and authenticates on every
  `getInventory()` call, then fetches page 1 (25 records) of the `items` collection with
  `expand: 'category_id'`. Record fields used by the table: `name`, `quantity`,
  `description`, `storage`, and `expand.category_id.name`.
- Search filtering is done imperatively in `App.updateTable`: it queries the DOM for
  `table tr.table-items` and toggles the global `.hidden` class (defined in `src/styles.css`)
  based on `innerHTML.includes(...)`, only for inputs of 3+ characters. It is case-sensitive and
  not driven by the signal.
- Styling: color palette as CSS custom properties on `:root` in `src/styles.css`
  (`--primary`, `--secondary`, `--success`, `--error`, `--info`, `--third`); JetBrains Mono is
  self-hosted from `public/`. The production build enforces a 4 kB warning / 8 kB error budget
  per component stylesheet.
- TypeScript is strict, including `noPropertyAccessFromIndexSignature` and `strictTemplates` —
  hence the bracket access (`item["name"]`) on PocketBase `RecordModel`s in templates.
