# useGraphql

API:

```js
const [{
  data, error, loading
}, {
  refetch, abort, setTimeout, setVariables, setInit, setOperationName
}] = useGraphql({
  key, url, query, variables, operationName, init = fetchOptions, skip, timeout
}, {onComplete, onError, onAborted})
```

I lied about zero-dependency ;)

Actually you need to have `graphql`, `graphql-tag` and `reactn` in your `package.json`

# Examples:

More to come...