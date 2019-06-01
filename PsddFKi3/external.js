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
      return 'https://api1.tzscan.io/v3'
    else if (net_type === 'alphanet')
      return 'https://api.alphanet.tzscan.io/v3'
    else
      throw 'The net type can only be mainnet or alphanet'
  }

  async originated_contracts(address : string, spendable : boolean = true, net_type? : string) {
    const url = this.domain(net_type || this.net_type) + `/operations/${address}?type=Origination`
    const operations  = await this.fetch(url)
    const result = []
    if (operations instanceof Array) 
      operations.forEach(op => {
        op.type.operations.forEach(inner_op => {
          if (inner_op.spendable === spendable)
            result.push(inner_op.tz1.tz)
        })
      })
    else
      throw 'Operations is invalid'

    return result
  }

}