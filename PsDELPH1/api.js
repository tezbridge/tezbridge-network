// @flow

import type { GetRPCFunc, PostRPCFunc, TezJSON } from '../types'
import { safeProp } from '../types'
import { checkProps, filterHashUrl, OpStep } from '../util'

export const default_config = {
  gas_limit: '1040000',
  storage_limit: '60000',
  fake_sig: 'edsigu6FNEzqHPAbQAUjjKtcAFkiW4The5BQbCj53bCyV9st32aHrcZhqnzLWw74HiwMScMh1SiTgY8juYUAUsJ3JG2DvGeCFjd'
}

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
    const param = {"data": data_json,"type":type_json, "gas": default_config.gas_limit}
    return this.submit(`/chains/main/blocks/head/helpers/scripts/pack_data`, param)
               .then(x => safeProp(x, 'packed'))
               .catch(err => Promise.reject(err instanceof ProgressEvent ? 'Pack data failed' : err))
  }

  forge_operation(head_hash : string, ops : TezJSON) {
    const param = {
      branch: head_hash,
      contents: ops
    }
    return this.submit(`/chains/main/blocks/head/helpers/forge/operations`, param)
               .catch(err => Promise.reject(err instanceof ProgressEvent ? 'forge operation failed' : err))

  }

  run_operation(head_hash : string, chain_id: string, ops : TezJSON) {
    const param = {
      operation: {
        branch: head_hash,
        contents: ops,
        signature: default_config.fake_sig
      },
      chain_id
    }
    return this.submit(`/chains/main/blocks/head/helpers/scripts/run_operation`, param)
               .catch(err => Promise.reject(err instanceof ProgressEvent ? 'run operation failed' : err))
  }

  preapply_operation(head_hash : string, ops : TezJSON, protocol : string, signature : string) {
    const param = {
      branch: head_hash,
      contents: ops,
      protocol,
      signature
    }
    return this.submit(`/chains/main/blocks/head/helpers/preapply/operations`, [param])
               .catch(err => Promise.reject(err instanceof ProgressEvent ? 'preapply operation failed' : err))
  }

  inject_operation(signed_op : string) {
    return this.submit('/injection/operation', signed_op)
               .catch(err => Promise.reject(err instanceof ProgressEvent ? 'inject operation failed' : err))
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
      fee: default_config.gas_limit,
      gas_limit: default_config.gas_limit,
      storage_limit: default_config.storage_limit,
      amount: '0',
      counter,
      destination,
      // parameters?: $micheline.michelson_v1.expression
    }
  },
  origination(source: string, counter: string) {
    return {
      kind: 'origination',
      source,
      fee: default_config.gas_limit,
      counter,
      gas_limit: default_config.gas_limit,
      storage_limit: default_config.storage_limit,
      // manager_pubkey: manager_key,
      balance: '0',
      // spendable: true,
      // delegatable: true
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
  preProcess(op : Object) {
    if (op.source.indexOf('KT1') === 0)
      throw `PsBabyM1 does not support KT1 address to be the source`

    if (op.kind === 'origination') {
      if (!op.script) {
        op.script = {
          code: [{"prim":"parameter","args":[{"prim":"or","args":[{"prim":"lambda","args":[{"prim":"unit"},{"prim":"list","args":[{"prim":"operation"}]}],"annots":["%do"]},{"prim":"unit","annots":["%default"]}]}]},{"prim":"storage","args":[{"prim":"key_hash"}]},{"prim":"code","args":[[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]]}]],{"prim":"IF_LEFT","args":[[{"prim":"PUSH","args":[{"prim":"mutez"},{"int":"0"}]},{"prim":"AMOUNT"},[[{"prim":"COMPARE"},{"prim":"EQ"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}],[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"IMPLICIT_ACCOUNT"},{"prim":"ADDRESS"},{"prim":"SENDER"},[[{"prim":"COMPARE"},{"prim":"EQ"}],{"prim":"IF","args":[[],[[{"prim":"UNIT"},{"prim":"FAILWITH"}]]]}],{"prim":"UNIT"},{"prim":"EXEC"},{"prim":"PAIR"}],[{"prim":"DROP"},{"prim":"NIL","args":[{"prim":"operation"}]},{"prim":"PAIR"}]]}]]}],
          storage: {string: op.source}
        }
      }

    } else if (op.kind === 'transaction') {
      if (!op.parameters) {
        op.parameters = {
          entrypoint: 'default',
          value: {prim: 'Unit'}
        }
      } else if (!op.parameters.entrypoint) {
        const params = op.parameters
        op.parameters = {
          entrypoint: 'default',
          value: params
        }
      }
    }
  }
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
  }>, no_forge : boolean = false, prev_fetched : Object = {}) : Promise<any> {
    const ops : Array<TezJSON> = []
    const counter_prev = prev_fetched.counter || await this.fetch.counter(param.source)
    const manager_key = prev_fetched.manager_key || await this.fetch.manager_key(param.source)

    if (typeof counter_prev !== 'string')
      throw 'Invalid counter'

    let counter = parseInt(counter_prev) + 1 + ''

    if (!manager_key) {
      const reveal = default_op_params.reveal(param.source, param.public_key, counter)

      if (op_params.length && op_params[0].kind === 'reveal')
        ops.push(Object.assign({}, reveal, op_params.shift()))
      else
        ops.push(reveal)

      counter = parseInt(counter) + 1 + ''
    }

    op_params.forEach(item => {
      const op = {
        reveal: null,
        origination: Object.assign(
          {},
          default_op_params.origination(param.source, counter),
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

    const header : Object = prev_fetched.header || await this.fetch.header()

    if (!(typeof header.hash === 'string'))
      throw `Error type for head_hash result: ${header.hash.toString()}`

    const operation_hex = no_forge ? '' : await this.submit.forge_operation(header.hash, ops)

    return {
      protocol: header.protocol,
      operation_hex,
      branch: header.hash,
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

  async testMinFeeOperation(TBC : any, 
                            source : string, 
                            pub_key : string, 
                            op_params : any,
                            no_remote_forge : boolean = false,
                            outside : {step:number} = {step: 0}) {
    outside.step = 1

    const counter = await this.fetch.counter(source)
    const manager_key = await this.fetch.manager_key(source)
    const header : Object = await this.fetch.header()

    const prefetched = {counter, manager_key, header}

    let restricted_fee = default_config.gas_limit
    {
      const balance = await this.fetch.balance(source)
      const all_used = op_params.reduce((acc, op) => acc + parseInt(op.amount || op.balance || 0), 0)
      const fee_left = parseInt(balance) - all_used
      const [max_gas, max_storage] = [parseInt(default_config.gas_limit), parseInt(default_config.storage_limit)]

      if (fee_left / op_params.length > max_storage && 
            fee_left < (max_gas + max_storage) * op_params.length) {
          restricted_fee = Math.floor(fee_left / op_params.length - max_storage).toString()
      }
    }
    
    // operation bytes generated with max fee
    op_params.forEach(op => {
      delete op.fee
      delete op.gas_limit
      delete op.storage_limit
      
      if (restricted_fee !== default_config.gas_limit) {
        op.fee = restricted_fee
        op.gas_limit = restricted_fee
      }
    })

    const op_bytes_result = await this.makeOperationBytes({
      source: source,
      public_key: pub_key
    }, op_params, no_remote_forge, prefetched)

    const ops = op_bytes_result.contents

    outside.step = 2
    // remote / local bytes comparison
    const local_hex = TBC.localop.forgeOperation(op_bytes_result.contents, header.hash)
    if (!op_bytes_result.operation_hex)
      op_bytes_result.operation_hex = local_hex
    if (local_hex !== op_bytes_result.operation_hex) {
      throw `Inconsistent forged bytes:\nLocal(${local_hex})\nRemote(${op_bytes_result.operation_hex})`
    }

    // run the max fee operation to get the cost fee
    // also it will assign the cost fee to the items of `ops` 
    outside.step = 3
    const run_operation_result : any = await this.submit.run_operation(
      header.hash, header.chain_id, op_bytes_result.contents)

    let gas_sum = 0
    run_operation_result.contents.forEach((content, index) => {
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
          if (op.result.allocated_destination_contract)
            storage_limit += 257
        })
      }

      if (result.errors)
        throw `Operation errors:${JSON.stringify(result.errors, null, 2)}` 

      gas_limit += parseInt(result.consumed_gas)
      if (result.paid_storage_size_diff)
        storage_limit += parseInt(result.paid_storage_size_diff)
      if (result.originated_contracts)
        storage_limit += result.originated_contracts.length * 257
      if (result.allocated_destination_contract)
        storage_limit += 257

      ops[index].gas_limit = gas_limit + ''
      ops[index].storage_limit = storage_limit + ''
      ops[index].fee = '0'

      gas_sum += parseInt(gas_limit)
    })

    const op_with_sig = op_bytes_result.operation_hex + TBC.codec.toHex(TBC.codec.bs58checkDecode(default_config.fake_sig))
    const fee = Math.ceil(100 + op_with_sig.length / 2 + 0.1 * gas_sum)

    let fee_left = fee
    ops.forEach(op => {
      const consumption = fee_left <= +default_config.gas_limit ? fee_left : +default_config.gas_limit
      op.fee = consumption + ''
      fee_left -= consumption
    })
    if (fee_left)
      throw `Still need ${fee_left} fee to run the operation` 

    outside.step = 4
    // operation bytes generated with exact fee
    const final_op_result = await this.makeOperationBytes({
      source: source,
      public_key: pub_key
    }, ops, no_remote_forge, prefetched)

    outside.step = 5
    // remote / local bytes comparison
    const final_local_hex = TBC.localop.forgeOperation(final_op_result.contents, header.hash)
    if (!final_op_result.operation_hex)
      final_op_result.operation_hex = final_local_hex
    if (final_local_hex !== final_op_result.operation_hex) {
      throw `Inconsistent final forged bytes:\nLocal(${local_hex})\nRemote(${final_op_result.operation_hex})`
    }

    outside.step = 6
    const final_run_operation_result : any = await this.submit.run_operation(
      header.hash, header.chain_id, final_op_result.contents)

    return {
      fee,
      operation_contents: final_run_operation_result.contents
    }
  }

  async makeMinFeeOperationBase(TBC : any, 
                                source : string, 
                                pub_key : string, 
                                sign_fn : string => Promise<string>,
                                op_params : any,
                                no_remote_forge : boolean = false,
                                outside : {step:number} = {step: 0}) {

    outside.step = 1

    const counter = await this.fetch.counter(source)
    const manager_key = await this.fetch.manager_key(source)
    const header : Object = await this.fetch.header()

    const prefetched = {counter, manager_key, header}

    let restricted_fee = default_config.gas_limit
    {
      const balance = await this.fetch.balance(source)
      const all_used = op_params.reduce((acc, op) => acc + parseInt(op.amount || op.balance || 0), 0)
      const fee_left = parseInt(balance) - all_used
      const [max_gas, max_storage] = [parseInt(default_config.gas_limit), parseInt(default_config.storage_limit)]

      if (fee_left / op_params.length > max_storage && 
            fee_left < (max_gas + max_storage) * op_params.length) {
          restricted_fee = Math.floor(fee_left / op_params.length - max_storage).toString()
      }
    }
    
    // operation bytes generated with max fee
    op_params.forEach(op => {
      delete op.fee
      delete op.gas_limit
      delete op.storage_limit
      
      if (restricted_fee !== default_config.gas_limit) {
        op.fee = restricted_fee
        op.gas_limit = restricted_fee
      }
    })

    const op_bytes_result = await this.makeOperationBytes({
      source: source,
      public_key: pub_key
    }, op_params, no_remote_forge, prefetched)

    const ops = op_bytes_result.contents

    outside.step = 2
    // remote / local bytes comparison
    const local_hex = TBC.localop.forgeOperation(op_bytes_result.contents, header.hash)
    if (!op_bytes_result.operation_hex)
      op_bytes_result.operation_hex = local_hex
    if (local_hex !== op_bytes_result.operation_hex) {
      throw `Inconsistent forged bytes:\nLocal(${local_hex})\nRemote(${op_bytes_result.operation_hex})`
    }

    // run the max fee operation to get the cost fee
    // also it will assign the cost fee to the items of `ops` 
    outside.step = 3
    const run_operation_result : any = await this.submit.run_operation(
      header.hash, header.chain_id, op_bytes_result.contents)

    let gas_sum = 0
    run_operation_result.contents.forEach((content, index) => {
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
          if (op.result.allocated_destination_contract)
            storage_limit += 257
        })
      }

      if (result.errors)
        throw `Operation errors:${JSON.stringify(result.errors, null, 2)}` 

      gas_limit += parseInt(result.consumed_gas)
      if (result.paid_storage_size_diff)
        storage_limit += parseInt(result.paid_storage_size_diff)
      if (result.originated_contracts)
        storage_limit += result.originated_contracts.length * 257
      if (result.allocated_destination_contract)
        storage_limit += 257

      ops[index].gas_limit = gas_limit + ''
      ops[index].storage_limit = storage_limit + ''
      ops[index].fee = '0'

      gas_sum += parseInt(gas_limit)
    })

    const op_with_sig = op_bytes_result.operation_hex + TBC.codec.toHex(TBC.codec.bs58checkDecode(default_config.fake_sig))
    const fee = Math.ceil(100 + op_with_sig.length / 2 + 0.1 * gas_sum)

    let fee_left = fee
    ops.forEach(op => {
      const consumption = fee_left <= +default_config.gas_limit ? fee_left : +default_config.gas_limit
      op.fee = consumption + ''
      fee_left -= consumption
    })
    if (fee_left)
      throw `Still need ${fee_left} fee to run the operation` 

    outside.step = 4
    // operation bytes generated with exact fee
    const final_op_result = await this.makeOperationBytes({
      source: source,
      public_key: pub_key
    }, ops, no_remote_forge, prefetched)

    outside.step = 5
    // remote / local bytes comparison
    const final_local_hex = TBC.localop.forgeOperation(final_op_result.contents, header.hash)
    if (!final_op_result.operation_hex)
      final_op_result.operation_hex = final_local_hex
    if (final_local_hex !== final_op_result.operation_hex) {
      throw `Inconsistent final forged bytes:\nLocal(${local_hex})\nRemote(${final_op_result.operation_hex})`
    }

    outside.step = 6
    final_op_result.signature = await sign_fn(final_op_result.operation_hex)

    outside.step = 7
    // preapply the exact fee operation to get the originated contracts
    const final_op_with_sig = final_op_result.operation_hex + TBC.codec.toHex(TBC.codec.bs58checkDecode(final_op_result.signature))
    
    const final_preapplied : any = await this.submit.preapply_operation(
      header.hash, final_op_result.contents, header.protocol, final_op_result.signature)

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

    outside.step = 8
    
    return {
      fee,
      originated_contracts,
      branch: header.hash,
      operation_contents: final_op_result.contents,
      operation_with_sig: final_op_with_sig
    }
  }

  async makeMinFeeOperation(TBC : any, 
                            source : string | null, 
                            secret_key : string, 
                            op_params : any,
                            no_remote_forge : boolean = false,
                            outside : {step:number} = {step: 0}) {

    const key = TBC.crypto.getKeyFromSecretKey(secret_key)

    return await this.makeMinFeeOperationBase(
      TBC,
      source || key.address,
      key.getPublicKey(),
      async (op_bytes) => TBC.crypto.signOperation(op_bytes, secret_key),
      op_params,
      no_remote_forge,
      outside
    )
  }

}

export default { Gets, Posts, Mixed }