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
const [{json, error},{
  refetch
}] = useGraphql({
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
  key, url, mutation, variables, operationName, init, skip
})
```

How to update the cache is up to you with `{setCache, evictCache}`

Actually you need to have `graphql`, `graphql-tag` and `reactn` in your `package.json`

## Examples:

Pokemon Query

```js
import useGraphql from 'use-graphql'
const url = 'https://graphql-pokemon.now.sh'
const query = `{
  pokemon(name: "Pikachu") {
    name
    image
  }
}`

const Pokemon = () => {
  const [{json, error}, {refetch}] = useGraphql({
    key: "pokemon-pikachu", url, query
  })

  return (
    <Fragment>
      <Button onClick={refetch}>Refetch</Button>
      <If condition={json && json.data}>
        <SimpleImg height={200} src={data.pokemon.image} alt={data.pokemon.name} />
      </If>
      <If condition={error}>
        <div>{JSON.stringify(error)}</div>
      </If>
    </Fragment>
  )
}
```

Mutation:

```js
import useGraphql from 'use-graphql'
const url = "/graphql"
const insert_user = `
mutation {
  insert_user(objects:[{
    email: "test1234fdsssdsddsd",
  }]){
    affected_rows
    returning{
      email
    }
  }
}
`
const Example = () => {
  const mutate = useGraphql({
    url, mutate: insert_user
  })

  const user = {
    email: "dung@gmail.com",
    social: {
      facebook: "dung1",
      twitter: "dung2"
    }
  }

  return (
    <Formik
      initialValues={user}
      onSubmit={async (values, actions) => {
        console.log(inspect(values))
        const res = await mutate({variables: {input: [values]}})
        console.log(res)
        actions.setSubmitting(false);        
        refetch()
      }}
      render={({ errors, status, touched, isSubmitting }) => (
        <Form>
          <Field type="email" name="email" />
          <ErrorMessage name="email" component="div" />  
          <Field type="text" className="error" name="social.facebook" />
          <ErrorMessage name="social.facebook">
            {errorMessage => <div className="error">{errorMessage}</div>}
          </ErrorMessage>
          <Field type="text" name="social.twitter" />
          <ErrorMessage name="social.twitter" className="error" component="div"/>  
          {status && status.msg && <div>{status.msg}</div>}
          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </Form>
      )}
    />
  )
}
```
