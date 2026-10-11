// Inserts the test data from seed-data.mjs in one transaction. Re-running resets it to the
// defined state (upsert by id).
import {connect, describeError} from './connect.mjs';
import {collections} from './seed-data.mjs';

const pb = await connect();
const batch = pb.createBatch();
for (const [collection, records] of collections) {
  for (const record of records) {
    batch.collection(collection).upsert(record);
  }
}
try {
  await batch.send();
} catch (err) {
  console.error(`Seeding failed, nothing was changed: ${describeError(err)}`);
  process.exit(1);
}
for (const [collection, records] of collections) {
  console.log(`${collection}: ${records.length}`);
}
