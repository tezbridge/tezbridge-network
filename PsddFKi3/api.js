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

export const default_op_params : Object = {
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
      spendable: true,
      delegatable: true
      // "delegate"?: $Signature.Public_key_hash,
      // "script"?: $scripted.contracts
    }
  },
  delegation(source: string, delegate : string, counter : string) {
    return {
      counter,
      delegate,
      fee: "1420",
      gas_limit: "10000",
      kind: "delegation",
      source,
      storage_limit: "0"
    }
  }
}

export const op_processes = {
  preProcess(_ : any) {}
}

export class Mixed {
  fetch: Gets
  submit: Posts

  constructor(fetch: Gets, submit: Posts) {
    this.fetch = fetch
    this.submit = submit
  }

  async makeOperationBytes(param: {
    source : string,
    public_key: string
  }, op_params: Array<{
    kind : 'reveal' | 'origination' | 'transaction' | 'delegation',
    destination? : string,
    delegate? : string
  }>) : Promise<any> {
    const ops : Array<TezJSON> = []
    const counter_prev = await this.fetch.counter(param.source)
    const manager_key = await this.fetch.manager_key(param.source)

    if (typeof counter_prev !== 'string')
      throw 'Invalid counter'

    let counter = parseInt(counter_prev) + 1 + ''

    if (!safeProp(manager_key, 'key')) {
      const reveal = default_op_params.reveal(param.source, param.public_key, counter)

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
          default_op_params.origination(param.source, manager_pkh, counter),
          item
        ),
        transaction: Object.assign(
          {},
          default_op_params.transaction(param.source, item.destination || '', counter),
          item
        ),
        delegation: Object.assign(
          {},
          default_op_params.delegation(param.source, item.delegate || '', counter)  
        )
      }[item.kind]

      if (!op)
        throw `Invalid t(${item.kind}) in makeOperationBytes`

      op_processes.preProcess(op)
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

  async makeMinFeeOperation(TBC : any, source : string | null, secret_key : string, op_params : any) {
    const key = TBC.crypto.getKeyFromSecretKey(secret_key)

    op_params.forEach(op => {
      delete op.fee
      delete op.gas_limit
      delete op.storage_limit
    })

    const op_bytes_result = await this.makeOperationBytes({
      source: source || key.address,
      public_key: key.getPublicKey()
    }, op_params)

    const ops = op_bytes_result.contents

    const local_hex = TBC.localop.forgeOperation(op_bytes_result.contents, op_bytes_result.branch)
    if (local_hex !== op_bytes_result.operation_hex) {
      throw `Inconsistent forged bytes:\nLocal(${local_hex})\nRemote(${op_bytes_result.operation_hex})`
    }

    op_bytes_result.signature = TBC.crypto.signOperation(op_bytes_result.operation_hex, secret_key)
    const preapplyed_result : any = await this.submit.preapply_operation(
      op_bytes_result.branch, op_bytes_result.contents, op_bytes_result.protocol, op_bytes_result.signature)

    if (!(preapplyed_result instanceof Array))
      throw `Invalid preapplyed result: ${preapplyed_result}`

    let gas_sum = 0
    preapplyed_result[0].contents.forEach((content, index) => {
      let gas_limit = 0
      let storage_limit = 0

      const result = content.metadata.operation_result
      const internal_operation_results = content.metadata.internal_operation_results

      if (internal_operation_results) {
        internal_operation_results.forEach(op => {
          if (op.result.errors)
            throw `Internal operation errors:${JSON.stringify(op.result.errors, null, 2)}`

          gas_limit += parseInt(op.result.consumed_gas)
          if (op.result.paid_storage_size_diff)
            storage_limit += parseInt(op.result.paid_storage_size_diff)
          if (op.result.originated_contracts)
            storage_limit += op.result.originated_contracts.length * 257
        })
      }

      if (result.errors)
        throw `Operation errors:${JSON.stringify(result.errors, null, 2)}` 

      gas_limit += parseInt(result.consumed_gas)
      if (result.paid_storage_size_diff)
        storage_limit += parseInt(result.paid_storage_size_diff)
      if (result.originated_contracts)
        storage_limit += result.originated_contracts.length * 257

      ops[index].gas_limit = gas_limit + ''
      ops[index].storage_limit = storage_limit + ''
      ops[index].fee = '0'

      gas_sum += parseInt(gas_limit)
    })

    const op_with_sig = op_bytes_result.operation_hex + TBC.codec.toHex(TBC.codec.bs58checkDecode(op_bytes_result.signature))
    const fee = Math.ceil(100 + op_with_sig.length / 2 + 0.1 * gas_sum)

    let fee_left = fee
    ops.forEach(op => {
      const consumption = fee_left <= 400000 ? fee_left : 400000
      op.fee = consumption + ''
      fee_left -= consumption
    })
    if (fee_left)
      throw `Still need ${fee_left} fee to run the operation` 

    const final_op_result = await this.makeOperationBytes({
      source: source || key.address,
      public_key: key.getPublicKey()
    }, ops)

    const final_local_hex = TBC.localop.forgeOperation(final_op_result.contents, final_op_result.branch)
    if (final_local_hex !== final_op_result.operation_hex) {
      throw `Inconsistent final forged bytes:\nLocal(${local_hex})\nRemote(${final_op_result.operation_hex})`
    }

    final_op_result.signature = TBC.crypto.signOperation(final_op_result.operation_hex, secret_key)
    const final_op_with_sig = final_op_result.operation_hex + TBC.codec.toHex(TBC.codec.bs58checkDecode(final_op_result.signature))
    
    const final_preapplied : any = await this.submit.preapply_operation(
      final_op_result.branch, final_op_result.contents, final_op_result.protocol, final_op_result.signature)

    if (!(final_preapplied instanceof Array))
      throw `Invalid final preapplyed result: ${final_preapplied}`

    const originated_contracts = []
    final_preapplied[0].contents.forEach((content, index) => {
      const result = content.metadata.operation_result
      const internal_operation_results = content.metadata.internal_operation_results

      if (internal_operation_results) {
        internal_operation_results.forEach(op => {
          if (op.result.errors)
            throw `Final internal operation errors:${JSON.stringify(op.result.errors, null, 2)}` 

          if (op.result.originated_contracts)
            originated_contracts.push(op.result.originated_contracts)
        })
      }

      if (result.errors)
        throw `Final operation errors:${JSON.stringify(result.errors, null, 2)}` 

      if (result.originated_contracts)
        originated_contracts.push(result.originated_contracts)
    })

    return {
      fee,
      originated_contracts,
      branch: final_op_result.branch,
      operation_contents: final_op_result.contents,
      operation_with_sig: final_op_with_sig
    }
  }
}

export default { Gets, Posts, Mixed }