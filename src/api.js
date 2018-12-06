// @flow

import type { GetRPCFunc, TezJSON, ApiGetsFunc } from './types'
import { safeProp } from './types'

export const gets : ApiGetsFunc = (fetch : GetRPCFunc) => {
  const mapping : {[string]: any => Promise<TezJSON>} = {
    custom(path : string) {
      return fetch(path)
    },
    head(sub_key? : string) {
      return fetch(`/chains/main/blocks/head/${sub_key || ''}`)
    },
    hash() {
      return mapping.head('hash')
    },
    header() {
      return mapping.head('header')
    },
    protocol() {
      return mapping.header().then(x => safeProp(x, 'protocol'))
    },
    balance(address : string) {
      return fetch(`/chains/main/blocks/head/context/delegates/${address}/balance`)
    },
    contract(address : string) {
      return fetch(`/chains/main/blocks/head/context/contracts/${address}`)
    },
    manager_key(address : string) {
      return fetch(`/chains/main/blocks/head/context/contracts/${address}/manager_key`).then(x => safeProp(x, 'manager'))
    }
  }

  return mapping
}