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

  static params = {
    reveal(source: string, public_key: string, counter: string) {
      return {
        kind: 'reveal',
        source,
        fee: '1300',
        gas_limit: '10000',
        storage_limit: '0',
        public_key,
        counter
      }
    },
    transaction(source: string, destination: string, counter: string) {
      return {
        kind: 'transaction',
        source,
        fee: '400000',
        gas_limit: '400000',
        storage_limit: '60000',
        amount: '0',
        counter,
        destination,
        // parameters?: $micheline.michelson_v1.expression
      }
    },
    origination(source: string, manager_key: string, counter: string) {
      return {
        kind: 'origination',
        source,
        fee: '400000',
        counter,
        gas_limit: '400000',
        storage_limit: '60000',
        managerPubkey: manager_key,
        balance: '0',
        // "spendable"?: boolean,
        // "delegatable"?: boolean,
        // "delegate"?: $Signature.Public_key_hash,
        // "script"?: $scripted.contracts
      }
    }
  }

  async makeOperation(t: string, param: {
    source : string,
    public_key: string
  }, op_param: Object) {
    const ops = []
    const counter = await this.fetch.counter(param.source)
    const manager_key = await this.fetch.manager_key(param.source)

    if (typeof counter !== 'string')
      throw 'Invalid counter'

    if (!safeProp(manager_key, 'key')) {
      ops.push(Mixed.params.reveal(param.source, param.public_key, counter))
    }

    const manager_pkh = safeProp(manager_key, 'manager')
    if (typeof manager_pkh !== 'string')
      throw 'Invalid manager public key hash'

    const op = {
      origination: Object.assign(
        Mixed.params.origination(param.source, manager_pkh, counter),
        op_param
      )
    }[t]

    if (!op)
      throw `Invalid t(${t}) in makeOperation`

    ops.push(op)

    const head_hash = await this.fetch.hash()

    if (!(typeof head_hash === 'string'))
      throw `Error type for head_hash result: ${head_hash.toString()}`

    const operation_hex = await this.submit.forge_operation(head_hash, ops)
    const protocol = await this.fetch.protocol()

    return {
      protocol,
      operation_hex,
      branch: head_hash,
      contents: ops
    }
  }

  async originate(basic : {
    source : string,
    public_key: string
  }, op_param : Object) {
    return this.makeOperation('origination', {
      source: basic.source,
      public_key: basic.public_key
    }, op_param)
  }
}