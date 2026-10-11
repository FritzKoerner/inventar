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
- Backend: [PocketBase](https://pocketbase.io/) in Docker (`backend/`), at
  `http://127.0.0.1:8091/`

## Setup

```bash
npm install
```

The development build reads PocketBase credentials from
`src/environments/environment.development.ts`. The file is gitignored, so create it locally:

```ts
export const environment = {
  production: false,
  pocketbaseUrl: 'http://127.0.0.1:8091',
  pocketbaseSuperuser: 'admin@example.com',
  pocketbasePassword: '…',
};
```

Start PocketBase (the schema is created from `backend/pb_migrations` on first start) and
create a superuser with the credentials from the environment file:

```bash
cd backend
docker compose up -d --build
docker compose exec pocketbase /pb/pocketbase superuser upsert EMAIL PASS --dir /pb/pb_data
```

The admin UI is at `http://127.0.0.1:8091/_/`. Then start the dev server from the repo root:

```bash
npm start
```

The app runs at `http://localhost:4200/` and reloads on file changes.

## Commands

| Command                      | Description                         |
|------------------------------|-------------------------------------|
| `npm start`                  | Dev server (development config)     |
| `npm run build`              | Production build to `dist/`         |
| `npm run seed`               | Insert test data into PocketBase    |
| `npm run unseed`             | Remove exactly that test data       |

## Data model

| Collection          | Purpose                                                          |
|---------------------|------------------------------------------------------------------|
| `items`             | Equipment: name, quantity, broken count, location, category, picture, archived |
| `categories`        | Item categories                                                  |
| `locations`         | Where items are stored                                           |
| `rentals`           | A rental list: borrower, contact, start and due date             |
| `rental_items`      | Items on a rental with quantity and returned quantity            |
| `item_availability` | View: rented and available count per item                        |
| `rental_status`     | View: outstanding units per rental (0 = fully returned)          |

Schema changes are made as new migration files in `backend/pb_migrations/`.

### Test data

`npm run seed` inserts canteen equipment, categories, locations, and three rentals (open,
partly returned, returned) from `backend/scripts/seed-data.mjs`. All test records have ids
starting with `seed`; `npm run unseed` deletes exactly those and refuses if real records
still reference them. Both run in one transaction, and re-running `seed` resets the data.

The scripts log in as superuser with `PB_URL`, `PB_SUPERUSER_EMAIL` and
`PB_SUPERUSER_PASSWORD`, falling back to the values in `environment.development.ts`.

## Style

UI and CSS conventions are documented in [STYLEGUIDE.md](STYLEGUIDE.md).
