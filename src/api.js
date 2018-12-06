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
    header() {
      return mapping.head('header')
    },
    protocol() {
      return mapping.header().then(x => safeProp(x, 'protocol'))
    }
  }

  return mapping
}