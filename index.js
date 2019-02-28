import { useGlobal } from 'reactn';
import useCache from './useCache';
import { useState, useEffect } from 'react';
import gql from 'graphql-tag'
import {print} from 'graphql/language/printer'
function delay(t, v) {
  return new Promise(function(resolve) { 
    setTimeout(resolve.bind(null, v), t)
  });
}
const isQuery = (query) => {
  try {
    const q = query.definitions[0].operationName
    return q === 'query' || q === 'mutation'
  } catch (e) {
    throw e
  }
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
    return {data:json, error:null}
  } catch(error) {
    return {data:null, error}
  }
}


function useGraphql({
  key, url, query, variables = {}, operationName = null, init = fetchOptions, skip = false, timeout = 200
}, {onComplete, onError, onAborted}) {
  const gqlQuery = gql(query)

  if (isQuery) {
    const [cache] = useGlobal('cache')
    const setCache = useGlobal('setCache')
    const evictCache = useGlobal('evictCache')
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
          if (onAborted) {
            onAborted()
          }
        })
        setController(controller)
        setSignal(signal)
      }
      if (data && typeof(onComplete) === 'function') {
        onComplete()
      }
      if (error && typeof(onError) === 'function') {
        onError()
      }
      console.log('mount')
    }, [data])
    console.log('render')

    const miss = async () => { 
      setLoading(true)
      const val = await graphqlFetch({url, init: {...int, signal}, query:gqlQuery, variables:vr, operationName:op}, {timeout:to})
      setLoading(false)
      return val
    }

    const abort = () => {
      if (controller) {
        controller.abort()
      }
    }

    
    const [{data, error}, {refetch,}] = useCache(key, miss, skip, {cache, setCache, evictCache})

    return [{json:data, error, loading}, {refetch, abort, setTimeout, setVariables, setInit, setOperationName}]
  }
}

export default useGraphql
