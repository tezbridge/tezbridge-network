// @flow

import TBN from '../PsddFKi3/index'
import { defaultOpParams } from '../PsddFKi3/api'

const curr_default = {
  transaction(source: string, destination: string, counter: string) {
    return {
      kind: 'transaction',
      source,
      fee: '800000',
      gas_limit: '800000',
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
      fee: '800000',
      counter,
      gas_limit: '800000',
      storage_limit: '60000',
      managerPubkey: manager_key,
      balance: '0',
      spendable: true,
      delegatable: true
      // "delegate"?: $Signature.Public_key_hash,
      // "script"?: $scripted.contracts
    }
  }
}

Object.assign(defaultOpParams, curr_default)

export default TBN