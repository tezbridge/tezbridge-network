// @flow

import type { RPCFunc, ApiGetsFunc } from './types'
import { gets } from './api'

export class TezBridgeNetwork {
  host: string
  RPCFn: RPCFunc | null
  fetch: {[string]: any => Promise<JSON>}

  static RPCFn : RPCFunc = (url, data, method) => {
    return new Promise<JSON>((resolve, reject) => {
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
  
  constructor(params : {
    host: string, 
    RPCFn?: RPCFunc
  }) {
    if (!params.host)
      throw "Please set the host parameter"

    this.host = params.host
    this.RPCFn = params.RPCFn || null

    this.bindApi(gets)
  }

  bindApi(gets: {[string]: ApiGetsFunc}) {
    this.fetch = {}
    Object.keys(gets).forEach(key => {
      this.fetch[key] = (...args) => {
        return this.get(gets[key].apply(null, args))
      }
    })
  }

  get(url: string, data?: JSON) {
    return (this.RPCFn || TezBridgeNetwork.RPCFn)(this.host + url, data, 'GET')
  }

  post(url: string, data: JSON) {
    return (this.RPCFn || TezBridgeNetwork.RPCFn)(this.host + url, data, 'POST')
  }

}

export default TezBridgeNetwork