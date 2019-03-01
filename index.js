import { useGlobal } from 'reactn';
import useCache from './useCache';
import { useState, useEffect, useCallback } from 'react';
import gql from 'graphql-tag'
import {print} from 'graphql/language/printer'
function delay(t, v) {
  return new Promise(function(resolve) { 
    setTimeout(resolve.bind(null, v), t)
  });
}
const queryType = (query) => {
  return query.definitions[0].operationName
}
const isServer = typeof(window) === 'undefined'
const fetchOptions = {
  method: 'post',
  headers: { 'Content-Type': 'application/json' }
}
async function graphqlFetch({
  url,
  init,
  query,
  variables,
  operationName,
}, {
  timeout
}) {
  let response
  try {
    if (!isServer) { await delay(timeout) }
    
    response = await fetch(url,
      {
        ...init,
        body: JSON.stringify({
          query:print(query),
          variables,
          operationName
        })
      }
    )
    //const response = await retryFetch(url, options);
    const json = await response.json();
    return {data:json, error:null, response}
  } catch(error) {
    return {data:null, error, response}
  }
}


function useGraphql({
  key, url, query, variables = {}, operationName = null, init = fetchOptions, skip = false, timeout = 200
}, options = {onComplete: null, onError: null, onAborted: null}) {
  const gqlQuery = gql(query)
  const [cache] = useGlobal('cache')
  const setCache = useGlobal('setCache')
  const evictCache = useGlobal('evictCache')
  const [q, setGqlQuery] = useState(gqlQuery)
  const [vr, setVariables] = useState(variables)
  const [int, setInit] = useState(init) 
  const [op, setOperationName] = useState(operationName)
  let [controller, setController] = useState(null)
  let [signal, setSignal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [to, setTimeout] = useState(timeout)
  
  useEffect(() => {
    if (!controller) {
      controller = new AbortController()
      signal = controller.signal
      signal.addEventListener("abort", () => {
        console.log("aborted!")
        if (options.onAborted) {
          options.onAborted()
        }
      })
      setController(controller)
      setSignal(signal)
    }
    if (data && typeof(options.onComplete) === 'function') {
      options.onComplete()
    }
    if (error && typeof(options.onError) === 'function') {
      options.onError()
    }
    console.log('mount')
  }, [data])
  console.log('render')
  const miss = async () => { 
    setLoading(true)
    const val = await graphqlFetch({url, init: {...int, signal}, query:q, variables:vr, operationName:op}, {timeout:to})
    setLoading(false)
    return val
  }

  const abort = () => {
    if (controller) {
      controller.abort()
    }
  }

  const setQuery = (newQuery) => {
    setGqlQuery(gql(newQuery))
  }

  const mutate = async (cb, args = {url, init: {...int, signal}, query:q, variables:vr, operationName:op} , options = {timeout:to}) => {
    const d = await graphqlFetch(args, options)
    cb(d, {cache, setCache, evictCache})
  }

  const [{data, error, response}, {refetch}] = useCache(key, miss, skip, {cache, setCache, evictCache})

  return [{refetch, abort, query:mutate, setLoading, setQuery, setTimeout, setVariables, setInit, setOperationName}, {json:data, error, loading, response},]
}

export default useGraphql
