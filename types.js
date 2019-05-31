// @flow

export type TezJSON =
| number
| string
| boolean
| void
| {[string]: TezJSON}
| Array<TezJSON>

export function safeProp(x : TezJSON, ...props : Array<string | number>) {
  let result = undefined

  let prop
  let curr = x
  while (true) {
    prop = props.shift()
    if (prop === undefined)
      break

    if (curr instanceof Object && !(curr instanceof Array)) {
      result = curr[prop]
      curr = curr[prop]
    } else if (curr instanceof Array) {
      const prop_index = parseInt(prop)
      if (isNaN(prop_index))
        return undefined

      result = curr[prop_index]
      curr = curr[prop_index]
    } else {
      return undefined
    }
  }

  return result
}

export type RPCFunc = (url: string, data?: TezJSON, method: 'POST' | 'GET') => Promise<TezJSON>
export type GetRPCFunc = (url: string, data?: TezJSON) => Promise<TezJSON>
export type PostRPCFunc = (url: string, data: TezJSON) => Promise<TezJSON>
