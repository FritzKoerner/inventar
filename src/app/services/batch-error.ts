import {ClientResponseError} from 'pocketbase';

// A failed batch reports only "Batch transaction failed."; the real error of the failing
// request sits under data.requests[index].response. Returns it as a single-request error.
export function unwrapBatchError(err: unknown): {index: number; error: ClientResponseError} | null {
  if (!(err instanceof ClientResponseError)) {
    return null;
  }
  const requests: Record<string, {response?: object}> = err.response['data']?.requests ?? {};
  const [index, failed] = Object.entries(requests)[0] ?? [];
  if (index === undefined || !failed?.response) {
    return null;
  }
  return {
    index: Number(index),
    error: new ClientResponseError({url: err.url, status: err.status, response: failed.response}),
  };
}
