import { useState, useEffect, useCallback, useRef } from "react";
import readCache from 'utils/readCache'
const isServer = typeof(window) === 'undefined'
function useCache(key, miss, skip, {cache, setCache, evictCache}) {
  //const {cache, setCache, evictCache} = useContext(GlobalContext)  
  // Cache the current value locally, with use state.
  let [value, setValue] = useState({data: null, error: null});
  let [prevKey, setPrevKey] = useState(null);
  const [sk, setSk] = useState(skip)

  async function fetchData() {
    try {
      // refetch, which fetches from cache first
      value = await readCache(cache, key, miss, setCache, true);
      setValue(value);
      setPrevKey(key);           
    } catch (e) {
      value = await e
      setValue(value);
      setPrevKey(key);           
    }            
  }

  //const refetch = useCallback(fetchData)
  
  if ((key !== prevKey) && !sk && isServer) {
    // When the key changes, we need to update the locally cached value. Read
    // the corresponding value from the cache using Suspense.
    value = readCache(cache, key, miss, setCache, false);
    setValue(value);
    setPrevKey(key);
  }


  useEffect(() => {
    fetchData()
    //evictCache(key);
    setSk(false)
  }, [cache, key])

  // Once this value successfully commits, immediately evict it from the cache.

  return [value, {refetch:fetchData}];
}

/*
function evictCache(cache, key) {
  delete(cache, key);
}
*/

export default useCache

