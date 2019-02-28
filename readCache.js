
// This rest is a basic Suspense cache implementation.
const PENDING = 0;
const RESOLVED = 1;
const REJECTED = 2;

export default function readCache(cache, key, miss, setCache, rf) {
  if (rf || !cache[key]) {
    const promise = miss();
    const record = {
      status: PENDING,
      value: promise
    };
    promise.then(
      value => {
        if (record.status === PENDING) {
          record.status = RESOLVED;
          record.value = value;
        }
      },
      error => {
        if (record.status === PENDING) {
          record.status = REJECTED;
          record.value = error;
        }
      }
    );
    setCache(key, record)
    //cache[key] = record;
    switch (record.status) {
      case PENDING:
        throw promise;
      case RESOLVED:
        const value = record.value;
        return value;
      case REJECTED:
        const error = record.error;
        throw error;
    }
  }
  else if (cache[key]) {
    const record = cache[key];
    switch (record.status) {
      case PENDING:
        const promise = record.value;
        throw promise;
      case RESOLVED:
        const value = record.value;
        return value;
      case REJECTED:
        const error = record.value;
        throw error;
    }
  }       
}
