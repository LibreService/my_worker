import { ASYNC_FS } from '@libreservice/wasm-code'
import { LambdaWorker } from './LambdaWorker'

/**
 * Wraps file system operations in worker thread.
 * Use it with `expose`.
 */
function fsOperate (operation: string, ...args: any[]) {
  const result = Module.FS[operation](...args)
  if (operation === 'mkdir') {
    return // result not serializable
  }
  return result
}

/**
 * Proxy file system operations in main thread.
 *
 * @param worker - The lambda worker
 * @returns An object similar to Module.FS but has async functions
 */
function asyncFS (worker: LambdaWorker): ASYNC_FS {
  const fsOperate: (operation: string, ...args: any[]) => Promise<any> = worker.register('fsOperate')
  return new Proxy({}, {
    get (target, prop: string) {
      return (...args: any[]) => fsOperate(prop, ...args)
    }
  }) as ASYNC_FS
}

export { asyncFS, fsOperate }
