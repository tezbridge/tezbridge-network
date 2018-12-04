// @flow

import TezBridgeNetwork from './../src/index'

import _assert from 'assert'
import https from 'https'
import url from 'url'

const assert = (v, m) => {
  _assert.ok(v, m)
  console.log('\x1b[32m%s\x1b[0m','PASS:', m)
}

const RPCFn = (raw_url: string, data?: JSON, method: 'POST' | 'GET') => {
  return new Promise<JSON>((resolve, reject) => {
    const parsed_url = url.parse(raw_url)
    const options = {
      hostname: parsed_url.hostname,
      port: parsed_url.port,
      path: parsed_url.path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (d) => {
        data += d.toString()
      })

      res.on('end', () => {
        resolve(JSON.parse(data))
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

const network_client = new TezBridgeNetwork({
  host: 'https://alphanet.tezrpc.me',
  RPCFn
})

const main = async () => {
  const r1: any = await network_client.fetch.head()
  assert(r1.header.level > 1, 'head.header.level')

  const r2: any = await network_client.fetch.head('header')
  assert(r2.level > 1, 'header.level')
}

main()
