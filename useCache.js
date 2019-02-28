import { useState, useEffect, useCallback } from "react";
import readCache from './readCache'

function useCache(key, miss, skip, {cache, setCache, evictCache}) {
  //const {cache, setCache, evictCache} = useContext(GlobalContext)  
  const [sk, setSk] = useState(skip)

  // Cache the current value locally, with use state.
  let [value, setValue] = useState({data: null, error: null});
  let [prevKey, setPrevKey] = useState(null);

  const refetch = useCallback(async () => {
    try {
      value = await readCache(cache, key, miss, setCache, true);
      setValue(value);
      setPrevKey(key);
    } catch (e) {
      value = await e      
      setValue(value);
      setPrevKey(key);
      evictCache(key)
      setSk(false)
    }
  })
  
  if ((key !== prevKey) && !skip) {
    // When the key changes, we need to update the locally cached value. Read
    // the corresponding value from the cache using Suspense.
    value = readCache(cache, key, miss, setCache, false);
    setValue(value);
    setPrevKey(key);
  }

  // Once this value successfully commits, immediately evict it from the cache.
  useEffect(
    () => {
      evictCache(key);
      setSk(false)
    },
    [cache, key, sk]
  );

  return [value, {refetch}];
}

/*
function evictCache(cache, key) {
  delete(cache, key);
}
*/

export default useCache

