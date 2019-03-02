import useAsync from './useAsync'

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
  key, url, query, fetch: generic, mutation, variables = {}, operationName = null, init = fetchOptions, skip = false
}) {
  if (generic) {
    return useAsync(key, generic, skip)
  }
  if (query) {
    const [{data, error}, {refetch}] = useAsync(key, async () => {
      return await asyncFetch({url, init, query, variables, operationName,})
    }, skip)

    return [{json:data, error}, {refetch}]
  } else if (mutation) {
    
    const callback = async ({variables}) => {
      const json = await asyncFetch({url, init, query:mutation, variables, operationName,})
      const res = await json.json()
      return res
    }
    
    return callback
  }
}

export default useGraphQLFetch
