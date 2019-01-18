// @flow

import PsddFKi3_API from './PsddFKi3/api'
import type { RPCFunc, TezJSON } from './types'

const APIs = {
  PsddFKi3: PsddFKi3_API
}

export class TezBridgeNetwork {
  host: string
  RPCFn: RPCFunc | null
  fetch: PsddFKi3_API.Gets
  submit: PsddFKi3_API.Posts
  mixed: PsddFKi3_API.Mixed

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
    protocol?: string,
    RPCFn?: RPCFunc
  }) {
    if (!params.host)
      throw "Please set the host parameter"

    this.host = params.host
    this.RPCFn = params.RPCFn || null

    const protocol = params.protocol || 'PsddFKi3'

    if (!(protocol in APIs)) {
      throw `Protocol:${protocol} doesn't exist in protocols`
    }

    this.fetch = new APIs[protocol].Gets((url, data) => this.get.call(this, url, data))
    this.submit = new APIs[protocol].Posts((url, data) => this.post.call(this, url, data))
    this.mixed = new APIs[protocol].Mixed(this.fetch, this.submit)
  }

  modProtocol(protocol : string) {
    if (!(protocol in APIs)) {
      throw `Protocol:${protocol} doesn't exist in protocols`
    }
    
    this.fetch = new APIs[protocol].Gets((url, data) => this.get.call(this, url, data))
    this.submit = new APIs[protocol].Posts((url, data) => this.post.call(this, url, data))
    this.mixed = new APIs[protocol].Mixed(this.fetch, this.submit)
  }

  get(url: string, data?: TezJSON) {
    return (this.RPCFn || TezBridgeNetwork.RPCFn)(this.host + url, data, 'GET')
  }

  post(url: string, data: TezJSON) {
    return (this.RPCFn || TezBridgeNetwork.RPCFn)(this.host + url, data, 'POST')
  }
}

export default TezBridgeNetwork