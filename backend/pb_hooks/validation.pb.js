/// <reference path="../pb_data/types.d.ts" />

// Cross-field rules that collection field options can't express. They run on every save,
// including the admin UI, so the counts behind item_availability can't go negative.
// Hook handlers run in isolated contexts, so shared helpers can't live at top level.

onRecordValidate((e) => {
  const quantity = e.record.getInt("quantity");
  const broken = e.record.getInt("quantity_broken");
  if (broken > quantity) {
    throw new BadRequestError("Es können nicht mehr Teile defekt sein als vorhanden sind.");
  }

  const result = new DynamicModel({ rented: 0 });
  e.app
    .db()
    .newQuery(
      "SELECT COALESCE(SUM(quantity - returned_quantity), 0) AS rented FROM rental_items WHERE item = {:item}",
    )
    .bind({ item: e.record.id })
    .one(result);
  if (quantity - broken < result.rented) {
    throw new BadRequestError(
      `${result.rented} Teile sind verliehen; Anzahl minus defekte Teile darf nicht kleiner sein.`,
    );
  }

  e.next();
}, "items");

onRecordValidate((e) => {
  const quantity = e.record.getInt("quantity");
  const returned = e.record.getInt("returned_quantity");
  if (returned > quantity) {
    throw new BadRequestError("Es können nicht mehr Teile zurückgegeben werden als verliehen wurden.");
  }

  const outstanding = quantity - returned;
  if (outstanding > 0) {
    const item = e.app.findRecordById("items", e.record.getString("item"));
    if (item.getBool("archived") && e.record.isNew()) {
      throw new BadRequestError("Archivierte Teile können nicht verliehen werden.");
    }

    const result = new DynamicModel({ rented: 0 });
    e.app
      .db()
      .newQuery(
        "SELECT COALESCE(SUM(quantity - returned_quantity), 0) AS rented FROM rental_items WHERE item = {:item} AND id != {:id}",
      )
      .bind({ item: item.id, id: e.record.id })
      .one(result);
    const available = item.getInt("quantity") - item.getInt("quantity_broken") - result.rented;
    if (outstanding > available) {
      throw new BadRequestError(`Nur ${available} Teile von „${item.getString("name")}“ verfügbar.`);
    }
  }

  e.next();
}, "rental_items");
