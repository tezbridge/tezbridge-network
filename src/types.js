// @flow

export type TezJSON =
| number
| string
| boolean
| void
| {[string]: TezJSON}

export type RPCFunc = (url: string, data?: TezJSON, method: 'POST' | 'GET') => Promise<TezJSON>
export type GetRPCFunc = (url: string, data?: TezJSON) => Promise<TezJSON>
export type PostRPCFunc = (url: string, data: TezJSON) => Promise<TezJSON>

export type ApiGetsFunc = GetRPCFunc => {[string]: any => Promise<TezJSON>}