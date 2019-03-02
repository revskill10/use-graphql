const { setGlobal, getGlobal, addReducer, resetGlobal } = require('reactn');
const LRU = require('lru_map').LRUMap

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

export const setupGlobalCache = (limit = 3) => {
  let cache = new LRU(limit);

  setupGlobal({cache})
}

export const getGlobalCache = () => {
  const cache = getGlobal().cache.toJSON()
  return {
    cache
  }
}

export const loadGlobalCache = (serialized, limit = 3) => {
  let cache = new LRU(serialized.cache)
  //cache.fromJSON(serialized.cache)
  setupGlobal({cache})
}
