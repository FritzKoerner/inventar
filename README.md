# Inventar

A web app for managing the equipment of a canteen kitchen. It focuses on simplicity and
usability: finding an item, seeing where it is, and knowing whether it is available should
take as few steps as possible.

## Features

Planned:

- **Items**: add, remove, and view items. Each item has a name, amount, description,
  location, category, picture, and status (e.g. broken, currently rented out).
- **Rental lists**: record which items were rented out, when, and who took them.

Currently implemented: an overview table of all items (name, amount, description, location,
category) with a text search.

## Stack

- Frontend: Angular 21 (this repo)
- Backend: [PocketBase](https://pocketbase.io/), run separately, expected at
  `http://127.0.0.1:8090/`

## Setup

```bash
npm install
```

The development build reads PocketBase credentials from
`src/environments/environment.development.ts`. The file is gitignored, so create it locally:

```ts
export const environment = {
  production: false,
  pocketbaseSuperuser: 'admin@example.com',
  pocketbasePassword: '…',
};
```

Start PocketBase, then the dev server:

```bash
npm start
```

The app runs at `http://localhost:4200/` and reloads on file changes.

## Commands

| Command                      | Description                         |
|------------------------------|-------------------------------------|
| `npm start`                  | Dev server (development config)     |
| `npm run build`              | Production build to `dist/`         |
| `npm test`                   | Unit tests with Vitest (watch mode) |
| `npx ng test --watch=false`  | Unit tests, single run              |

## Style

UI and CSS conventions are documented in [STYLEGUIDE.md](STYLEGUIDE.md).
