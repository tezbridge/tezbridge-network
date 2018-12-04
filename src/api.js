// @flow

import type { ApiGetsFunc } from './types'

export const gets : {[string]: ApiGetsFunc} = {
  head(sub_key? : string) {
    return `/chains/main/blocks/head/${sub_key || ''}`
  }
}