// @flow

import TezBridgeNetwork from './../src/index'

const network_client = new TezBridgeNetwork({
  host: 'https://alphanet.tezrpc.me'
  // TODO: add node https request function
})

network_client.get('/chains/main/blocks/head/')