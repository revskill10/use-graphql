# useGraphql React Hook

## Status

Under development

## Installation

Just copy and paste from this repository in the mean time.

You'll need a global cache for SSR to hydrate on client.

The cache needs to have three action

```js
const globalCache = {cache, setCache, evictCache} 
```

```js
cache = {}
setCache = (key, value) => {}
evictCache = (key) => {}
```

You can use Redux or a normal global cache for this (I recommend `reactn` for this).

## API:

```js
const [{
  refetch, abort, query, setQuery, setTimeout, setVariables, setInit, setOperationName
},{
  json, error, loading
}] = useGraphql({
  key, url, query, variables, operationName, init, skip, timeout
}, {onComplete, onError, onAborted})
```

### Note

- `refetch` will use current arguments `{
  key, url, query, variables, operationName, init, skip, timeout
}` and has no additional option, it'll automatically update the cache with `key`

- query will have arguments 

```js
{
  query, variables, operationName, init, skip, timeout
}
```

and returns a `Promise`, how to update the cache is up to you.


Actually you need to have `graphql`, `graphql-tag` and `reactn` in your `package.json`

## Examples:

Pokemon

```js
import useGraphql from 'use-graphql'

const Pokemon = () => {
  const url = 'https://graphql-pokemon.now.sh'
  const query = `{
    pokemon(name: "Pikachu") {
      name
      image
    }
  }`

  const [{json, error, loading},{refetch, setVariables}] = useGraphql({
    key: "pokemon-pikachu", url, query, timeout: 4000
  }, { 
    onComplete: () => console.log(inspect(json)),
    onError: () => {console.log(inspect(error))}
  })

  return (
    <Fragment>
      <Button onClick={refetch}>Refetch</Button>
      <Button onClick={() => setVariables({a: 1})}>Variables</Button>
      <If condition={json}>
        <With data={json.data}>
          <If condition={loading}>Loading</If>
          <SimpleImg height={200} src={data.pokemon.image} alt={data.pokemon.name} />
        </With>
      </If>
      <If condition={error}>
        <div>{JSON.stringify(error)}</div>
      </If>
    </Fragment>
  )
}