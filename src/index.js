// @flow

import type { RPCFunc, TezJSON } from './types'
import { Gets, Posts, Mixed } from './api'

export class TezBridgeNetwork {
  host: string
  RPCFn: RPCFunc | null
  fetch: Gets
  submit: Posts
  mixed: Mixed

  static RPCFn : RPCFunc = (url, data, method) => {
    return new Promise<TezJSON>((resolve, reject) => {
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

    this.fetch = new Gets((url, data) => this.get.call(this, url, data))
    this.submit = new Posts((url, data) => this.post.call(this, url, data))

    this.mixed = new Mixed(this.fetch, this.submit)
  }


  get(url: string, data?: TezJSON) {
    return (this.RPCFn || TezBridgeNetwork.RPCFn)(this.host + url, data, 'GET')
  }

  post(url: string, data: TezJSON) {
    return (this.RPCFn || TezBridgeNetwork.RPCFn)(this.host + url, data, 'POST')
  }
}

export default TezBridgeNetwork