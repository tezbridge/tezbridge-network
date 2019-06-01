// @flow

const RPCFn = (() => {
  if (process.env.NODE_ENV === 'browser') {
    return (url, data, method) => {
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
        req.send(data instanceof Object ? JSON.stringify(data) : undefined)
      })
    }
  } else {
    const https = require('https')
    const url = require('url')
    return (raw_url: string, data?: TezJSON, method: 'POST' | 'GET') => {
      return new Promise<TezJSON>((resolve, reject) => {
        const parsed_url = url.parse(raw_url)
        const options = {
          hostname: parsed_url.hostname,
          port: parsed_url.port,
          path: parsed_url.path,
          method,
          headers: raw_url.indexOf('tzscan.io/v3') > -1 ? {} : {
            'Content-Type': 'application/json'
          }
        }

        const req = https.request(options, (res) => {
          let data = ''
          res.on('data', (d) => {
            data += d.toString()
          })

          res.on('end', () => {
            try {
              resolve(JSON.parse(data))
            } catch(err) {
              console.log('\x1b[31m%s\x1b[0m','RPC result JSON.parse error: ', data)
            }
          })
        })

        req.on('error', (e) => {
          reject(e)
        })

        if (method === 'POST') {
          req.write(JSON.stringify(data))
        }

        req.end()
      })
    }
  }
})()

import Api from './api'
import { External } from './external'
import type { RPCFunc, TezJSON } from '../types'

export class TezBridgeNetwork {
  host: string
  RPCFn: RPCFunc
  net_type: 'mainnet' | 'alphanet'
  fetch: Api.Gets
  submit: Api.Posts
  mixed: Api.Mixed
  external: External

  constructor(params : {
    host: string
  }) {
    if (!params.host)
      throw "Please set the host parameter"

    this.host = params.host
    this.RPCFn = RPCFn
    this.net_type = this.host.indexOf('alphanet') > -1 ? 'alphanet' : 'mainnet'

    this.fetch = new Api.Gets((url, data) => this.get.call(this, url, data))
    this.submit = new Api.Posts((url, data) => this.post.call(this, url, data))
    this.mixed = new Api.Mixed(this.fetch, this.submit)
    this.external = new External((url, data) => this.RPCFn(url, data, 'GET'), this.net_type)
  }

  get(url: string, data?: TezJSON) {
    return this.RPCFn(this.host + url, data, 'GET')
  }

  post(url: string, data: TezJSON) {
    return this.RPCFn(this.host + url, data, 'POST')
  }
}

export default TezBridgeNetwork