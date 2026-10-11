/// <reference path="../pb_data/types.d.ts" />

const authOnly = "@request.auth.id != ''";
const rules = {
  listRule: authOnly,
  viewRule: authOnly,
  createRule: authOnly,
  updateRule: authOnly,
  deleteRule: authOnly,
};
const timestamps = [
  { name: "created", type: "autodate", onCreate: true, onUpdate: false },
  { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
];

migrate(
  (app) => {
    for (const name of ["categories", "locations"]) {
      app.save(
        new Collection({
          type: "base",
          name,
          ...rules,
          fields: [{ name: "name", type: "text", required: true, max: 100 }, ...timestamps],
          indexes: [`CREATE UNIQUE INDEX idx_${name}_name ON ${name} (name COLLATE NOCASE)`],
        }),
      );
    }

    const categories = app.findCollectionByNameOrId("categories");
    const locations = app.findCollectionByNameOrId("locations");
    const users = app.findCollectionByNameOrId("users");

    app.save(
      new Collection({
        type: "base",
        name: "items",
        ...rules,
        // Items are archived instead of deleted so rental history stays intact.
        deleteRule: null,
        fields: [
          { name: "name", type: "text", required: true, max: 200, presentable: true },
          { name: "quantity", type: "number", onlyInt: true, min: 0 },
          { name: "quantity_broken", type: "number", onlyInt: true, min: 0 },
          { name: "description", type: "text", max: 2000 },
          { name: "location", type: "relation", collectionId: locations.id, maxSelect: 1 },
          { name: "category", type: "relation", collectionId: categories.id, maxSelect: 1 },
          {
            name: "picture",
            type: "file",
            maxSelect: 1,
            maxSize: 5 * 1024 * 1024,
            mimeTypes: ["image/jpeg", "image/png", "image/webp"],
            thumbs: ["100x100", "400x0"],
          },
          { name: "archived", type: "bool" },
          ...timestamps,
        ],
      }),
    );

    app.save(
      new Collection({
        type: "base",
        name: "rentals",
        ...rules,
        fields: [
          { name: "borrower", type: "text", required: true, max: 200, presentable: true },
          { name: "contact", type: "text", max: 200 },
          { name: "start_date", type: "date", required: true },
          { name: "due_date", type: "date" },
          { name: "note", type: "text", max: 2000 },
          { name: "created_by", type: "relation", collectionId: users.id, maxSelect: 1 },
          ...timestamps,
        ],
      }),
    );

    const items = app.findCollectionByNameOrId("items");
    const rentals = app.findCollectionByNameOrId("rentals");

    app.save(
      new Collection({
        type: "base",
        name: "rental_items",
        ...rules,
        fields: [
          {
            name: "rental",
            type: "relation",
            collectionId: rentals.id,
            maxSelect: 1,
            required: true,
            cascadeDelete: true,
          },
          { name: "item", type: "relation", collectionId: items.id, maxSelect: 1, required: true },
          { name: "quantity", type: "number", onlyInt: true, min: 1, required: true },
          { name: "returned_quantity", type: "number", onlyInt: true, min: 0 },
          { name: "returned_at", type: "date" },
          ...timestamps,
        ],
        indexes: [
          "CREATE UNIQUE INDEX idx_rental_items_rental_item ON rental_items (rental, item)",
        ],
      }),
    );

    app.save(
      new Collection({
        type: "view",
        name: "item_availability",
        listRule: authOnly,
        viewRule: authOnly,
        viewQuery: `
          SELECT
            items.id,
            items.quantity,
            items.quantity_broken,
            CAST(COALESCE(SUM(ri.quantity - ri.returned_quantity), 0) AS INTEGER) AS rented,
            CAST(items.quantity - items.quantity_broken
              - COALESCE(SUM(ri.quantity - ri.returned_quantity), 0) AS INTEGER) AS available
          FROM items
          LEFT JOIN rental_items ri ON ri.item = items.id
          GROUP BY items.id`,
      }),
    );

    app.save(
      new Collection({
        type: "view",
        name: "rental_status",
        listRule: authOnly,
        viewRule: authOnly,
        viewQuery: `
          SELECT
            rentals.id,
            CAST(COALESCE(SUM(ri.quantity - ri.returned_quantity), 0) AS INTEGER) AS outstanding,
            MAX(ri.returned_at) AS last_returned_at
          FROM rentals
          LEFT JOIN rental_items ri ON ri.rental = rentals.id
          GROUP BY rentals.id`,
      }),
    );
  },
  (app) => {
    for (const name of [
      "rental_status",
      "item_availability",
      "rental_items",
      "rentals",
      "items",
      "locations",
      "categories",
    ]) {
      app.delete(app.findCollectionByNameOrId(name));
    }
  },
);
