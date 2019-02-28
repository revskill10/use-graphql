# useGraphql React Hook

## Installation

Just copy and paste from this repository in the mean time

## API:

```js
const [{
  json, error, loading
}, {
  refetch, abort, setQuery, setTimeout, setVariables, setInit, setOperationName
}] = useGraphql({
  key, url, query, variables, operationName, init, skip, timeout
}, {onComplete, onError, onAborted})
```

I lied about zero-dependency ;)

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