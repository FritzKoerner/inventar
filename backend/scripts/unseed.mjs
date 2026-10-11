// Deletes exactly the records from seed-data.mjs, in one transaction. Refuses if real data
// still references test data: PocketBase would otherwise clear those references silently.
import {connect, describeError} from './connect.mjs';
import {collections, categories, items, locations, rentals, rentalItems} from './seed-data.mjs';

const pb = await connect();
const anyOf = (field, records) => records.map((r) => `${field} = "${r.id}"`).join(' || ');
const noneOf = (records) => records.map((r) => `id != "${r.id}"`).join(' && ');

const blockers = [
  ...(await pb.collection('items').getFullList({
    filter: `(${noneOf(items)}) && (${anyOf('category', categories)} || ${anyOf('location', locations)})`,
  })).map((r) => `item "${r.name}" (${r.id}) uses a test category or location`),
  ...(await pb.collection('rental_items').getFullList({
    filter: `(${noneOf(rentalItems)}) && (${anyOf('item', items)} || ${anyOf('rental', rentals)})`,
  })).map((r) => `rental line ${r.id} references a test item or rental`),
];
if (blockers.length) {
  console.error('Not removing test data, real records reference it:');
  blockers.forEach((b) => console.error(`  - ${b}`));
  process.exit(1);
}

const batch = pb.createBatch();
const counts = [];
for (const [collection, records] of [...collections].reverse()) {
  const existing = await pb.collection(collection).getFullList({filter: anyOf('id', records), fields: 'id'});
  existing.forEach((r) => batch.collection(collection).delete(r.id));
  counts.push([collection, existing.length]);
}
if (counts.every(([, n]) => n === 0)) {
  console.log('No test data found.');
  process.exit(0);
}
try {
  await batch.send();
} catch (err) {
  console.error(`Removing failed, nothing was changed: ${describeError(err)}`);
  process.exit(1);
}
counts.forEach(([collection, n]) => console.log(`${collection}: ${n}`));
