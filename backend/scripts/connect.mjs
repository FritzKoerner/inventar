// Superuser connection for the dev scripts. Credentials come from PB_URL, PB_SUPERUSER_EMAIL
// and PB_SUPERUSER_PASSWORD, falling back to src/environments/environment.development.ts.
import {readFileSync} from 'node:fs';
import PocketBase from 'pocketbase';

function fromEnvironmentFile() {
  const path = new URL('../../src/environments/environment.development.ts', import.meta.url);
  let source = '';
  try {
    source = readFileSync(path, 'utf8');
  } catch {
    return {};
  }
  const get = (key) => source.match(new RegExp(key + String.raw`\s*:\s*(['"])(.*?)\1`))?.[2];
  return {
    url: get('pocketbaseUrl'),
    email: get('pocketbaseSuperuser'),
    password: get('pocketbasePassword'),
  };
}

export async function connect() {
  const file = fromEnvironmentFile();
  const url = process.env.PB_URL ?? file.url ?? 'http://127.0.0.1:8091';
  const email = process.env.PB_SUPERUSER_EMAIL ?? file.email;
  const password = process.env.PB_SUPERUSER_PASSWORD ?? file.password;
  if (!email || !password) {
    throw new Error('No superuser credentials: set PB_SUPERUSER_EMAIL and PB_SUPERUSER_PASSWORD.');
  }
  const pb = new PocketBase(url);
  await pb.collection('_superusers').authWithPassword(email, password);
  return pb;
}

// PocketBase reports a failed batch as "Batch transaction failed."; surface the real cause.
export function describeError(err) {
  const failed = Object.entries(err?.response?.data?.requests ?? {})[0];
  if (failed) {
    const [index, {response}] = failed;
    return `request ${index}: ${response?.message} ${JSON.stringify(response?.data ?? {})}`;
  }
  return err?.message ?? String(err);
}
