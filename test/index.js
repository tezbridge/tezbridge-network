// @flow

import TezBridgeNetwork from './../src/index'
import { RPCFn, assert } from './util'


const network_client = new TezBridgeNetwork({
  host: 'https://alphanet.tezrpc.me',
  RPCFn
})

const main = async () => {
  const r1 : Object = await network_client.fetch.head()
  assert(r1.header.level > 1, 'FETCH: head.header.level')

  const r2 : Object = await network_client.fetch.header()
  assert(r2.level > 1, 'FETCH: header.level')

  const r3 : Object = await network_client.fetch.protocol()
  assert(r3.length === 51 && r3[0] === 'P', 'FETCH: head.header.protocol')

  const r4 : Object = await network_client.fetch.hash()
  assert(r4.length === 51, 'FETCH: head.hash')

  const r5 : Object = await network_client.fetch.contract('KT1Ap4UZRBGGo9Pm92sFbR8gJrrFTfUbX4kc')
  assert(r5.script && r5.manager && r5.balance, 'FETCH: contract')

  const r6 : Object = await network_client.fetch.balance('tz1TUswtLE1cTBgoBC2JAtQ5Jsz2crp1tZvJ')
  assert(parseInt(r6) > 1, 'FETCH: contract.balance')

  const r7 : Object = await network_client.fetch.manager_key('KT1Ap4UZRBGGo9Pm92sFbR8gJrrFTfUbX4kc')
  assert(r7 === 'tz1gRaTpXdZPEdcoG85gG9EuUYNeRKuTUoz4', 'FETCH: contract.manager')

  const r8 : Object = await network_client.submit.pack_data(
    { "prim": "Pair", "args": [ { "string": "abc" }, { "int": "34" } ] }, 
    { "prim": "pair", "args": [ { "prim": "string" }, { "prim": "nat" } ] }
  )
  assert(r8 === '05070701000000036162630022', 'SUBMIT: pack data')
}

main()
