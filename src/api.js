// @flow

import type { GetRPCFunc, PostRPCFunc, TezJSON } from './types'
import { safeProp } from './types'
import { checkProps, OpStep } from './util'


export class Gets {
  fetch : GetRPCFunc
  static filter_hash_url(x : string) {
    if (x.indexOf('/') === -1)
      throw "The input hash_url should be in this format: `xx/xx/xx/xx/xx/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`"

    const start = x[0] === '/' ? 1 : 0
    const end = x.slice(-1) === '/' ? -1 : x.length

    return x.slice(start, end)
  }

  constructor(fetch : GetRPCFunc) {
    this.fetch = fetch
  }
  custom(path : string) {
    return this.fetch(path)
  }
  head(sub_path? : string) {
    return this.fetch(`/chains/main/blocks/head/${sub_path || ''}`)
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
  predecessor() {
    return this.header().then(x => safeProp(x, 'predecessor'))
  }
  balance(address : string) {
    return this.fetch(`/chains/main/blocks/head/context/delegates/${address}/balance`)
  }
  contract(address : string) {
    return this.fetch(`/chains/main/blocks/head/context/contracts/${address}`)
  }
  contract_bytes(hash_url : string, sub_path? : string) {
    const hash = Gets.filter_hash_url(hash_url)
    return this.fetch(`/chains/main/blocks/head/context/raw/bytes/contracts/index/originated/${hash}${sub_path || ''}`)
  }
  storage_bytes(hash_url : string) {
    return this.contract_bytes(hash_url, '/data/storage')
  }
  big_map_bytes(hash_url : string) {
    return this.contract_bytes(hash_url, '/big_map')
  }
  manager_key(address : string) {
    return this.fetch(`/chains/main/blocks/head/context/contracts/${address}/manager_key`)
           .then(x => safeProp(x, 'manager'))
  }
  counter(address : string) {
    return this.fetch(`/chains/main/blocks/head/context/contracts/${address}/counter`)
  }

}

export class Posts {
  submit : PostRPCFunc

  constructor(submit : PostRPCFunc) {
    this.submit = submit
  }

  pack_data(data_json : TezJSON, type_json : TezJSON) {
    const param = {"data": data_json,"type":type_json, "gas": "400000"}
    return this.submit(`/chains/main/blocks/head/helpers/scripts/pack_data`, param)
               .then(x => safeProp(x, 'packed'))
  }

  forge_operation(head_hash : string, ops : TezJSON) {
    const param = {
      branch: head_hash,
      contents: ops
    }
    return this.submit(`/chains/main/blocks/head/helpers/forge/operations`, param)
               .then(x => console.log(x))
  }

  preapply_operation(head_hash : string, ops : TezJSON, protocol : string, signature : string) {
    const param = {
      branch: head_hash,
      contents: ops,
      protocol,
      signature
    }
    return this.submit(`/chains/main/blocks/head/helpers/preapply/operations`, [param])
               .then(x => console.log(x))
  }

  inject_operation(signed_op : string) {
    return this.submit('/injection/operation', signed_op)
               .then(x => console.log(x))
  }
}


export class Mixed {
  fetch: Gets
  submit: Posts
  constructor(fetch: Gets, submit: Posts) {
    this.fetch = fetch
    this.submit = submit
  }

  async originate(param: {
    key_hash : string
  }) {
    const counter = await this.fetch.counter(param.key_hash)

    const submit_param = Object.assign({}, {
      kind: "origination",
      // source: this.key_pair.public_key_hash,
      fee: "400000",
      // counter: $positive_bignum,
      gas_limit: "400000",
      storage_limit: "60000",
      // managerPubkey: this.key_pair.public_key_hash,
      balance: "0",
      // "spendable"?: boolean,
      // "delegatable"?: boolean,
      // "delegate"?: $Signature.Public_key_hash,
      // "script"?: $scripted.contracts
    }, {
      counter,
      managerPubkey: param.key_hash
    })

    const head = await this.fetch.head()

    if (!(typeof head === 'string'))
      throw `Error type for head result: ${head.toString()}`

    const forget_result = await this.submit.forge_operation(head, [submit_param])
  }
}