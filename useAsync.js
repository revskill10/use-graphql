import useCache from 'hooks/useCache'
import { useGlobal } from 'reactn';

function useAsync(key, cb, skip) {  
  const [cache] = useGlobal('cache')
  const setCache = useGlobal('setCache')
  const evictCache = useGlobal('evictCache')
  const [{data, error},{refetch}] = useCache(key, async () => {
    let response
    try {
      response = await cb({key})
      //const response = await retryFetch(url, options);
      const json = await response.json();
      return {data:json, error:null}
    } catch(error) {
      return {data:null, error}
    }
  }, skip, {cache, setCache, evictCache});
  
  return [{data, error}, {refetch}]
}

export default useAsync
