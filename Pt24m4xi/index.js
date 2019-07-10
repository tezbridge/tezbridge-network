// @flow

import TBN from '../PsddFKi3/index'
import { default_config, default_op_params, op_processes } from '../PsddFKi3/api'

default_config.gas_limit = '800000'

Object.assign(default_op_params, {
  origination(source: string, manager_key: string, counter: string) {
    return {
      kind: 'origination',
      source,
      fee: '800000',
      counter,
      gas_limit: '800000',
      storage_limit: '60000',
      manager_pubkey: manager_key,
      balance: '0',
      spendable: true,
      delegatable: true
      // "delegate"?: $Signature.Public_key_hash,
      // "script"?: $scripted.contracts
    }
  }
})


function preProcess(op : Object) {
  if (op.kind !== 'origination')
    return undefined

  if (op.script && op.spendable)
    throw `You cannot originate spendable smart contract in Pt24m4xi`

  if (!op.script && !op.spendable)
    throw `You cannot originate non-spendable account in Pt24m4xi`
}
Object.assign(op_processes, {preProcess})

export default TBN