// @flow


export type RPCFunc = (url: string, data?: JSON, method: 'POST' | 'GET') => Promise<JSON>
export type ApiGetsFunc = any => string