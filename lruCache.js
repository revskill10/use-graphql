import { setGlobal, getGlobal, addReducer, resetGlobal } from 'reactn';
import {LRUMap} from 'lru_map'

const setupGlobal = ({cache}) => {
  resetGlobal()
  setGlobal({
    cache
  });
  addReducer('setCache', (global, key, record) => {
    global.cache.set(key, record)
    return {
      cache: global.cache
    }}
  );

  addReducer('evictCache', (global, key) => {
    //delete(global.cache, key)
    global.cache.delete(key)
    return {
      cache: global.cache
    }}
  );
}

export const setupGlobalCache = () => {
  let cache = new LRUMap(4);

  setupGlobal({cache})
}

export const getGlobalCache = () => {
  const cache = getGlobal().cache.toJSON()
  return {
    cache
  }
}

export const loadGlobalCache = (serialized) => {
  let serialized_cache = serialized.cache.map(it => {
    return [it.key, it.value]
  })
  let cache = new LRUMap(serialized_cache)

  //let cache = new LRUMap();
  //cache.assign(serialized.cache)
  //console.log(inspect(cache))
  setupGlobal({cache})
}
