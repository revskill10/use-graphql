import useAsync from 'hooks/useAsync'
import useSubscription from 'hooks/useSubscription'
import { useCallback } from 'react';

const fetchOptions = {
  method: 'post',
  headers: { 'Content-Type': 'application/json' }
}
async function asyncFetch({
  url,
  init,
  query,
  variables,
  operationName,
}) {
  return await fetch(url,
    {
      ...init,
      body: JSON.stringify({
        query,
        variables,
        operationName
      })
    }
  )
}
function useGraphQLFetch({
  key, url, query, fetch: generic, mutation, subscription, variables = {}, operationName = null, init = fetchOptions, skip = false
}, cb) {
  if (generic) {
    return useAsync(key, generic, skip)
  }
  if (query) {
    const [{data, error}, {refetch}] = useAsync(key, async () => {
      return await asyncFetch({url, init, query, variables, operationName,})
    }, skip)

    const callback =  useCallback(async ({variables = variables}) => {
      const json = await asyncFetch({url, init, query, variables, operationName,})
      const res = await json.json()
      return res
    })

    return [{json:data, error}, {refetch, fetch:callback}]
  } else if (mutation) {
    
    const callback = useCallback(async ({variables}) => {
      const json = await asyncFetch({url, init, query:mutation, variables, operationName,})
      const res = await json.json()
      return res
    })
    
    return callback
  } else if (subscription) {
    const onData = (data) => cb(data, null)
    const onError = (error) => cb(null, error)
    return useSubscription({
      uri: url, 
      headers: init.headers, 
      query: subscription, 
      onData,
      onError, 
      variables,
    })
  }
}

export default useGraphQLFetch
