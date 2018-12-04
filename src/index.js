// @flow

import type { JSONType, RPCFuncType } from './types'


export class TezBridgeNetwork {
  host: string
  RPCFn: RPCFuncType | null

  constructor(params : {
    host: string, 
    RPCFn?: RPCFuncType
  }) {
    if (!params.host)
      throw "Please set the host parameter"

    this.host = params.host
    this.RPCFn = params.RPCFn || null
  }

  static RPCFn : RPCFuncType = (url, data, method) => {
    return new Promise<JSONType>((resolve, reject) => {
      const req = new XMLHttpRequest()
      req.addEventListener('load', (pe: ProgressEvent) => {
        if (req.status === 200)
          resolve(JSON.parse(req.responseText))
        else
          reject(req.responseText)
      })
      req.addEventListener('error', reject)
      req.addEventListener('abort', reject)
      req.open(method, url)
      if (method === 'POST') {
        req.setRequestHeader('Content-Type', 'application/json')
      }
      req.send(JSON.stringify(data))
    })
  }

  get(url: string, data: JSONType) {
    return (this.RPCFn || TezBridgeNetwork.RPCFn)(this.host + url, data, 'GET')
  }

  post(url: string, data: JSONType) {
    return (this.RPCFn || TezBridgeNetwork.RPCFn)(this.host + url, data, 'POST')
  }
}

export default TezBridgeNetwork