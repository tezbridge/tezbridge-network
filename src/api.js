// @flow

import type { GetRPCFunc, PostRPCFunc, TezJSON } from './types'
import { safeProp } from './types'

export class Gets {
  fetch : GetRPCFunc

  constructor(fetch : GetRPCFunc) {
    this.fetch = fetch
  }
  custom(path : string) {
    return this.fetch(path)
  }
  head(sub_key? : string) {
    return this.fetch(`/chains/main/blocks/head/${sub_key || ''}`)
  }
  hash() {
    return this.head('hash')
  }
  header() {
    return this.head('header')
  }
  protocol() {
    return this.header().then(x => safeProp(x, 'protocol'))
  }
  balance(address : string) {
    return this.fetch(`/chains/main/blocks/head/context/delegates/${address}/balance`)
  }
  contract(address : string) {
    return this.fetch(`/chains/main/blocks/head/context/contracts/${address}`)
  }
  manager_key(address : string) {
    return this.fetch(`/chains/main/blocks/head/context/contracts/${address}/manager_key`)
           .then(x => safeProp(x, 'manager'))
  }
}

export class Posts {
  submit : PostRPCFunc

  constructor(submit : PostRPCFunc) {
    this.submit = submit
  }

  pack_data(data_json : TezJSON, type_json : TezJSON) {
    const param = {"data": data_json,"type":type_json, "gas": "400000"}
    return this.submit(`/chains/main/blocks/head/helpers/scripts/pack_data`, param).then(x => safeProp(x, 'packed'))
  }
}

