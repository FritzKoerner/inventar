// Test data shared by seed.mjs and unseed.mjs. Every id starts with "seed" (ids are 15 chars of
// [a-z0-9]); unseed deletes exactly these ids, so real records are never matched by name.

const day = (offset) => new Date(Date.now() + offset * 86_400_000).toISOString();

export const locations = [
  {id: 'seedloc00000001', name: 'Keller Regal 1'},
  {id: 'seedloc00000002', name: 'Keller Regal 2'},
  {id: 'seedloc00000003', name: 'Spülküche'},
  {id: 'seedloc00000004', name: 'Trockenlager'},
];

export const categories = [
  {id: 'seedcat00000001', name: 'Töpfe und Pfannen'},
  {id: 'seedcat00000002', name: 'Besteck'},
  {id: 'seedcat00000003', name: 'Geschirr'},
  {id: 'seedcat00000004', name: 'Elektrogeräte'},
  {id: 'seedcat00000005', name: 'Transport'},
];

export const items = [
  {id: 'seeditm00000001', name: 'Kochtopf 20 l', quantity: 6, quantity_broken: 1, description: 'Edelstahl, mit Deckel', location: 'seedloc00000001', category: 'seedcat00000001'},
  {id: 'seeditm00000002', name: 'Kochtopf 50 l', quantity: 2, quantity_broken: 0, description: 'Für Suppen und Eintöpfe', location: 'seedloc00000001', category: 'seedcat00000001'},
  {id: 'seeditm00000003', name: 'Bratpfanne 32 cm', quantity: 8, quantity_broken: 2, description: 'Gusseisen', location: 'seedloc00000001', category: 'seedcat00000001'},
  {id: 'seeditm00000004', name: 'Schöpfkelle', quantity: 15, quantity_broken: 0, description: '', location: 'seedloc00000003', category: 'seedcat00000002'},
  {id: 'seeditm00000005', name: 'Gabel', quantity: 300, quantity_broken: 0, description: 'Standardbesteck Mensa', location: 'seedloc00000003', category: 'seedcat00000002'},
  {id: 'seeditm00000006', name: 'Messer', quantity: 300, quantity_broken: 4, description: 'Standardbesteck Mensa', location: 'seedloc00000003', category: 'seedcat00000002'},
  {id: 'seeditm00000007', name: 'Suppenteller', quantity: 250, quantity_broken: 12, description: 'Porzellan, weiß', location: 'seedloc00000002', category: 'seedcat00000003'},
  {id: 'seeditm00000008', name: 'Kaffeetasse', quantity: 120, quantity_broken: 5, description: '', location: 'seedloc00000002', category: 'seedcat00000003'},
  {id: 'seeditm00000009', name: 'Pürierstab', quantity: 3, quantity_broken: 1, description: '750 W', location: 'seedloc00000004', category: 'seedcat00000004'},
  {id: 'seeditm00000010', name: 'Wasserkocher', quantity: 4, quantity_broken: 0, description: '1,7 l', location: 'seedloc00000004', category: 'seedcat00000004'},
  {id: 'seeditm00000011', name: 'Thermobox GN 1/1', quantity: 10, quantity_broken: 0, description: 'Für Speisentransport', location: 'seedloc00000004', category: 'seedcat00000005'},
  {id: 'seeditm00000012', name: 'Servierwagen', quantity: 3, quantity_broken: 1, description: 'Drei Ebenen', location: 'seedloc00000002', category: 'seedcat00000005'},
];

// One open, one partly returned, one fully returned rental.
export const rentals = [
  {id: 'seedrnt00000001', borrower: 'Fachschaft Informatik', contact: 'fsr-info@example.org', start_date: day(-2), due_date: day(5), note: 'Sommerfest'},
  {id: 'seedrnt00000002', borrower: 'Studentenwerk Cafeteria Ost', contact: '0341 000000', start_date: day(-10), due_date: day(-3), note: 'Aushilfe während Umbau'},
  {id: 'seedrnt00000003', borrower: 'Institut für Biologie', contact: '', start_date: day(-30), due_date: day(-25), note: 'Tag der offenen Tür'},
];

export const rentalItems = [
  {id: 'seedrli00000001', rental: 'seedrnt00000001', item: 'seeditm00000011', quantity: 4, returned_quantity: 0, returned_at: ''},
  {id: 'seedrli00000002', rental: 'seedrnt00000001', item: 'seeditm00000010', quantity: 2, returned_quantity: 0, returned_at: ''},
  {id: 'seedrli00000003', rental: 'seedrnt00000002', item: 'seeditm00000007', quantity: 50, returned_quantity: 30, returned_at: day(-3)},
  {id: 'seedrli00000004', rental: 'seedrnt00000002', item: 'seeditm00000005', quantity: 50, returned_quantity: 50, returned_at: day(-3)},
  {id: 'seedrli00000005', rental: 'seedrnt00000003', item: 'seeditm00000001', quantity: 2, returned_quantity: 2, returned_at: day(-25)},
];

// Creation order; unseed deletes in reverse.
export const collections = [
  ['locations', locations],
  ['categories', categories],
  ['items', items],
  ['rentals', rentals],
  ['rental_items', rentalItems],
];
