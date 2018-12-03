// @flow

export type JSONType =
| null
| void
| string
| number
| boolean
| { [string]: JSON }
| Array<JSON>

export type RPCFuncType = (url: string, data: JSONType, method: 'POST' | 'GET') => Promise<JSONType>