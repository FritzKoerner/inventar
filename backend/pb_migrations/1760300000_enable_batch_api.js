/// <reference path="../pb_data/types.d.ts" />

// Rentals are created together with their rental_items in one batch request, so a failed
// line (e.g. not enough items available) can't leave a half-saved rental behind.
migrate(
  (app) => {
    const settings = app.settings();
    settings.batch.enabled = true;
    settings.batch.maxRequests = 100;
    settings.batch.timeout = 3;
    app.save(settings);
  },
  (app) => {
    const settings = app.settings();
    settings.batch.enabled = false;
    app.save(settings);
  },
);
