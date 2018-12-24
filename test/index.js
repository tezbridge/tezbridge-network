// @flow

import TezBridgeNetwork from './../src/index'
import { Gets } from './../src/api'

import { RPCFn, assert } from './util'

const network_client = new TezBridgeNetwork({
  host: 'https://testnet.tezbridge.com',
  RPCFn
})

const fn_tests = async () => {
  {
    const r1 = Gets.filter_hash_url('3e/e2/31/36/6b/1336eb61419df8fc666056025929bf')
    const r2 = Gets.filter_hash_url('/3e/e2/31/36/6b/1336eb61419df8fc666056025929bf')
    const r3 = Gets.filter_hash_url('/3e/e2/31/36/6b/1336eb61419df8fc666056025929bf/')
    const r4 = Gets.filter_hash_url('3e/e2/31/36/6b/1336eb61419df8fc666056025929bf/')
    assert(
      r1 === r2 && r2 === r3 && r3 === r4 && r1 === '3e/e2/31/36/6b/1336eb61419df8fc666056025929bf', 
      'FN: filter hash url')
  }
}

const gets_tests = async () => {
  {
    const r : Object = await network_client.fetch.head()
    assert(r.header.level > 1, 'FETCH: head.header.level')
  }
  
  {
    const r : Object = await network_client.fetch.header()
    assert(r.level > 1, 'FETCH: header.level')
  }

  {
    const r : Object = await network_client.fetch.protocol()
    assert(r.length === 51 && r[0] === 'P', 'FETCH: head.header.protocol')
  }

  {
    const r : Object = await network_client.fetch.hash()
    assert(r.length === 51, 'FETCH: head.hash')
  }

  {
    const r : Object = await network_client.fetch.contract('KT1T8u994jypfZK68QGAR7rdKRzFHFTXsRDM')
    assert(r.script && r.manager && r.balance, 'FETCH: contract')
  }

  {
    const r : Object = await network_client.fetch.balance('tz1MJhE5bHTnwSsvZL8AQaXdriN1me16UtpG')
    assert(parseInt(r) > 1, 'FETCH: contract.balance')
  }

  {
    const r : Object = await network_client.fetch.manager_key('KT1T8u994jypfZK68QGAR7rdKRzFHFTXsRDM')
    assert(r === 'tz1aFrpsJ63J4psy4VDQjZork4uW9JuZiY9i', 'FETCH: contract.manager')
  }

  {
    const r : Object = await network_client.fetch.counter('tz1aFrpsJ63J4psy4VDQjZork4uW9JuZiY9i')
    assert(parseInt(r) > 1, 'FETCH: contract.counter')
  }

  {
    const r : Object = await network_client.fetch.predecessor()
    assert(r.length === 51, 'FETCH: head.header.predecessor')
  }

  {
    const r : Object = await network_client.fetch.contract_bytes('21/52/38/ac/1c/e4ec73e3ddac63eb58816f9a581d16')
    assert(r.balance && r.data && r.used_bytes && r.len && r.manager, 'FETCH: raw contract in bytes')
  }

  {
    const r : Object = await network_client.fetch.storage_bytes('21/52/38/ac/1c/e4ec73e3ddac63eb58816f9a581d16')
    const storage_len = parseInt(r.slice(0, 8), 16)
    assert(r.length === 8 + storage_len * 2, 'FETCH: raw storage of contract in bytes')
  }

  {
    const r : Object = await network_client.fetch.big_map_bytes('21/52/38/ac/1c/e4ec73e3ddac63eb58816f9a581d16')
    assert(Object.keys(r).reduce((acc, x) => acc && (x.length === 2 ? true : false), true), 'FETCH: raw big_map of contract in bytes')
  }
}

const posts_tests = async () => {
  {
    const r : Object = await network_client.submit.pack_data(
      { "prim": "Pair", "args": [ { "string": "abc" }, { "int": "34" } ] }, 
      { "prim": "pair", "args": [ { "prim": "string" }, { "prim": "nat" } ] }
    )
    assert(r === '05070701000000036162630022', 'SUBMIT: pack data')
  }
}

const main = async () => {
  await fn_tests()
  await gets_tests()
  await posts_tests()
}

main()
