// @flow
import type { GetRPCFunc, PostRPCFunc, TezJSON } from '../types'

export class External {
  fetch: GetRPCFunc
  net_type: 'mainnet' | 'alphanet'

  constructor(fetch : GetRPCFunc, net_type : string) {
    this.fetch = fetch
    this.net_type = net_type === 'alphanet' ? net_type : 'mainnet'
  }

  domain(net_type : string) {
    if (net_type === 'mainnet')
      return 'https://api.tezos.id/mooncake/mainnet/v1'
    else if (net_type === 'alphanet')
      return 'https://api.tezos.id/mooncake/babylonnet/v1'
    else if (net_type === 'zeronet')
      return 'https://api.tezos.id/mooncake/zeronet/v1'
    else
      throw 'The net type can only be mainnet or alphanet'
  }

  async originated_contracts(address : string, spendable : boolean = true, net_type? : string) {
    const url = this.domain(net_type || this.net_type) + `originations?account=${address}`
    const operations  = await this.fetch(url)
    const result = []
    if (operations instanceof Array) 
      operations.forEach(op => {
        op.origination.operationResultOriginatedContracts.forEach(contract => {
          result.push(contract)
        })
      })
    else
      throw 'Operations is invalid'

    return result
  }

}