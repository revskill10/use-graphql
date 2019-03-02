# useGraphql React Hook

## Status

Under development

## Why another graphql client ?

- When i look at `graphiql`, i ask myself, how to build my own `GraphiQL` in a simple way. 
Graphiql allows you to change `headers`, `variables`, `query`, multiple `operationName` is allowed, too.

- So i want to use Hook for this task.
What're problems with current approaches ?

Most of `graphql clients` requires you to create a `client` before hand. It's fine unless you want to:

- Having multiple queries inside the same components.
- Having just one cache for multiple clients.

Cache is the trickiest part here, especially if you want SSR with lazy components.


## Installation

Just copy and paste from this repository in the mean time.

You'll need a global cache for SSR to hydrate on client.


The cache needs to have two actions: `setCache` and `evictCache`

You can use `lruCache` in this repository for a reference.

SSR Example setup:

`server.js`
```js
import { setupGlobalCache, getGlobalCache } from './lru-cache'
const handler = (req, res) => {
  setupGlobalCache()
  ... // render React Component

  const globalValue = getGlobalCache()
  res.end(`
  <script id='graphql-state'>
    window.__PRELOADED_STATE__=${serialize(globalValue)}
  </script>
  `)
}
```

`client.js`

```js
import { loadGlobalCache } from './lru-cache'

loadGlobalCache(window.__PRELOADED_STATE__)
delete(window, '__PRELOADED_STATE__')
```

## API:

If `query`:

```js
const [{ json, error } , { refetch, fetch }]
= useGraphql({
  key, url, query, variables, operationName, init, skip
})
```

### Note

- `refetch` will use current arguments `{
  key, url, query, variables, operationName, init, skip, timeout
}` and has no additional option, it'll automatically update the cache with `key`

If `mutation`:

```js
const mutate = useGraphql({
  key, url, mutation, variables, operationName, init
})
```

How to update the cache is up to you with `{setCache, evictCache}`

Actually you need to have `graphql`, `graphql-tag` and `reactn` in your `package.json`

## Examples:

1. Refetching after a mutation

```js
const Example = () => {
  const [{json},{refetch}] = useGraphql({
    key: "all-temp1", url, query: allTemp1
  })
  const mutate = useGraphql({
    url, mutation: insert_temp1, skip: true
  })

  const temp1 = {
    hoten: "",
    code: ""
  }

  return (
    <div>
      <h1>All temp1</h1>
      <Button onClick={refetch}>Refetch</Button>
      <If condition={json && json.data}>
        <ul>
          <For each="item" index="index" of={ json.data.temp1 }>
            <li key={ item.id }>{item.hoten} - {item.code}</li>
          </For>
        </ul>
      </If>
    <Formik
      initialValues={temp1}
      onSubmit={async (values, actions) => {
        const res = await mutate({variables: {input: [values]}})
        actions.setSubmitting(false);        
        refetch()
      }}
      render={({ errors, status, touched, isSubmitting }) => (
        <div>
          <Child />
          <Form>
            <Field type="text" name="hoten" />
            <ErrorMessage name="email" component="div" />  
            <Field type="text" name="code" />
            <ErrorMessage name="code" component="div" />  
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </Form>        
        </div>
      )}
    />
    </div>
  )
}
```