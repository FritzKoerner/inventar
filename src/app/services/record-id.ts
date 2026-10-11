// PocketBase record ids: 15 chars of [a-z0-9]. Generated client-side so records in the same
// batch can reference a record that doesn't exist yet.
export function newRecordId(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(15)), (b) => alphabet[b % 36]).join('');
}
