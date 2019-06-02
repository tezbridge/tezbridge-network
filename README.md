# TezBridge Network client

[![Build Status](https://travis-ci.org/tezbridge/tezbridge-network.svg?branch=master)](https://travis-ci.org/tezbridge/tezbridge-network)
[![Known Vulnerabilities](https://snyk.io/test/github/tezbridge/tezbridge-network/badge.svg?targetFile=package.json)](https://snyk.io/test/github/tezbridge/tezbridge-network?targetFile=package.json)

[![npm](https://img.shields.io/npm/v/tezbridge-network.svg?color=birghtgreen)](https://www.npmjs.com/package/tezbridge-network)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/tezbridge-network.svg?color=brightgreen)](https://www.npmjs.com/package/tezbridge-network)

[![GitHub last commit](https://img.shields.io/github/last-commit/tezbridge/tezbridge-network.svg)](https://github.com/tezbridge/tezbridge-network/commits/master)

This library is compatible with the standard Tezos RPC protocol.

## Installation
`npm i tezbridge-network`

## Requirements
- `parcel-bundler` is needed. (`npm install -g parcel-bundler`)
- When the library is built for brower usage, the node env should be set to `browser`(`NODE_ENV=browser`)


# Documentation

## Network client instance

### network_client

##### create instance
```javascript
import TezBridgeNetwork from 'tezbridge-network/Pt24m4xi'
// import TezBridgeNetwork from 'tezbridge-network/PsddFKi3'
const network_client = new TezBridgeNetwork({
  host: 'https://mainnet-node.tzscan.io/'
})
```

## API reference

### network_client

##### `network_client.switchProtocol(protocol)`
Switch protocol on the fly

### network_client.fetch

##### `network_client.fetch.custom(path)`
Access content with the passing path

##### `network_client.fetch.head(sub_path?)`
Get the whole content of head block

##### `network_client.fetch.hash()`
Get head block hash in main chain

##### `network_client.fetch.header()`
Get the header of head block in main chain

##### `network_client.fetch.protocol()`
Get current protocol used in main chain

##### `network_client.fetch.predecessor()`
Get the predecessor of current head block

##### `network_client.fetch.balance(address)`
Get the balance of the passing address

##### `network_client.fetch.contract(address)`
Get the contract information of the padding address

##### `network_client.fetch.contract_bytes(hash_url, sub_path?)`
Get the contract raw bytes of the passing hash_url

**hash_url**: a special hex representation of contract hash. (eg: `3e/e2/31/36/6b/1336eb61419df8fc666056025929bf`)
You can generate such hash with the npm package `tezbridge-crypto`.

##### `network_client.fetch.storage_bytes(hash_url)`
Get the storage raw bytes of the contract

##### `network_client.fetch.big_map_bytes(hash_url)`
Get the big_map raw bytes of the contract

##### `network_client.fetch.manager_key(address)`
Get the manager key hash of the passing address

##### `network_client.fetch.counter(address)`
Get the counter value of the passing address


### network_client.submit

##### `network_client.submit.pack_data(data_json, type_json)`
Get packed data of the passing JSON content from RPC node

**data_json** and **type_json** are all in Micheline type.

example:
```
data_json = { "prim": "Pair", "args": [ { "string": "abc" }, { "int": "34" } ] }
type_json = { "prim": "pair", "args": [ { "prim": "string" }, { "prim": "nat" } ] }
``` 

##### `network_client.submit.forge_operation(head_hash, ops)`
Forge operation to get bytes.

**head_hash** is the hash of head block and **ops** is the the Michline operations in array.

##### `network_client.submit.preapply_operation(head_hash, ops, protocol, signature)`
Preapply operations to get results.

##### `network_client.submit.inject_operation(signed_op)`
Inject signed operation.


### network_client.mixed

##### `network_client.mixed.makeOperationBytes(param, op_params)`
Create operation bytes though remote RPC node.

Arguments types:
```
param: {
  source : string,
  public_key: string
}

op_params: Array<{
  kind : 'reveal' | 'origination' | 'transaction',
  ...any
}>
```

##### `network_client.mixed.makeTransactionBytes(param, op_param)`

Arguments types:
```
param: {
  source : string,
  public_key: string
}

op_param: {
  fee?: string,
  gas_limit?: string,
  storage_limit?: string,
  amount: string,
  destination: string,
  parameters?: Micheline
}
```

##### `network_client.mixed.makeOriginationBytes(param, op_param)`

Arguments types:
```
param: {
  source : string,
  public_key: string
}

op_param: {
  fee?: string,
  gas_limit?: string,
  storage_limit?: string,
  managerPubkey?: string,
  balance?: string,
  spendable?: boolean,
  delegatable?: boolean,
  delegate?: string,
  script?: Micheline
}
```

