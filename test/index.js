// @flow

import TezBridgeNetwork from './../src/index'
import { RPCFn, assert } from './util'


const network_client = new TezBridgeNetwork({
  host: 'https://alphanet.tezrpc.me',
  RPCFn
})

const main = async () => {
  const r1 : Object = await network_client.fetch.head()
  assert(r1.header.level > 1, 'head.header.level')

  const r2 : Object = await network_client.fetch.header()
  assert(r2.level > 1, 'header.level')

  const r3 : Object = await network_client.fetch.protocol()
  assert(r3.length === 51 && r3[0] === 'P', 'head.header.protocol')
}

main()
