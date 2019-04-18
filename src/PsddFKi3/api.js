// @flow

import type { GetRPCFunc, PostRPCFunc, TezJSON } from '../types'
import { safeProp } from '../types'
import { checkProps, filterHashUrl, OpStep } from '../util'


export class Gets {
  fetch : GetRPCFunc

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
    return this.fetch(`/chains/main/blocks/head/context/contracts/${address}/balance`)
  }
  contract(address : string) {
    return this.fetch(`/chains/main/blocks/head/context/contracts/${address}`)
  }
  contract_bytes(hash_url : string, sub_path? : string) {
    const hash = filterHashUrl(hash_url)
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
  }

  inject_operation(signed_op : string) {
    return this.submit('/injection/operation', signed_op)
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

  async makeOperationBytes(param: {
    source : string,
    public_key: string
  }, op_params: Array<{
    kind : 'reveal' | 'origination' | 'transaction',
    destination? : string
  }>) {
    const ops : Array<TezJSON> = []
    const counter_prev = await this.fetch.counter(param.source)
    const manager_key = await this.fetch.manager_key(param.source)

    if (typeof counter_prev !== 'string')
      throw 'Invalid counter'

    let counter = parseInt(counter_prev) + 1 + ''

    if (!safeProp(manager_key, 'key')) {
      const reveal = Mixed.params.reveal(param.source, param.public_key, counter)

      if (op_params.length && op_params[0].kind === 'reveal')
        ops.push(Object.assign({}, reveal, op_params.shift()))
      else
        ops.push(reveal)

      counter = parseInt(counter) + 1 + ''
    }

    const manager_pkh = safeProp(manager_key, 'manager')
    if (typeof manager_pkh !== 'string')
      throw 'Invalid manager public key hash'

    op_params.forEach(item => {
      const op = {
        reveal: null,
        origination: Object.assign(
          {},
          Mixed.params.origination(param.source, manager_pkh, counter),
          item
        ),
        transaction: Object.assign(
          {},
          Mixed.params.transaction(param.source, item.destination || '', counter),
          item
        )
      }[item.kind]

      if (!op)
        throw `Invalid t(${item.kind}) in makeOperationBytes`

      ops.push(op)
      counter = parseInt(counter) + 1 + ''
    })

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

  async makeOriginationBytes(basic : {
    source : string,
    public_key: string
  }, op_param : Object) {
    return this.makeOperationBytes({
      source: basic.source,
      public_key: basic.public_key
    }, [Object.assign({
      kind: 'origination'
    }, op_param)])
  }

  async makeTransactionBytes(basic : {
    source : string,
    public_key: string
  }, op_param : Object) {
    return this.makeOperationBytes({
      source: basic.source,
      public_key: basic.public_key
    }, [Object.assign({
      kind: 'transaction'
    }, op_param)])
  }
}

export default { Gets, Posts, Mixed }