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
    return {data:json, error:null}
  } catch(error) {
    return {data:null, error}
  }
}


function useGraphql({
  key, url, query, variables = {}, operationName = null, init = fetchOptions, skip = false, timeout = 200
}, {onComplete, onError, onAborted}) {
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

  const miss = async ({url = url, variables = vr, init = {...int, signal}, operationName=op, timeout=to }) => { 
    setLoading(true)
    const val = await graphqlFetch({url, init, query:q, variables, operationName}, {timeout})
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

  const [{data, error}, {refetch}] = useCache(key, miss, skip, {cache, setCache, evictCache})

  return [{refetch, abort, query:miss, setQuery, setTimeout, setVariables, setInit, setOperationName}, {json:data, error, loading},]
}

export default useGraphql
