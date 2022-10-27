type Functions = { [key: string]: (...args: any[]) => any }

/**
 * Exposes worker functions.
 *
 * @param functions - Map of name to function
 * @param readyPromise - A promise that must be resolved before any worker function calls
 */
function expose (functions: Functions, readyPromise?: Promise<any>) {
  self.onmessage = async (msg: MessageEvent<{
    name: string
    args: any[]
  }>) => {
    await readyPromise
    const { name, args } = msg.data
    let data: MessageData
    try {
      const workerFunction = functions[name]
      if (typeof workerFunction !== 'function') {
        console.error(`${name} is not an exposed worker function`)
        self.close()
        return // close doesn't immediately kill the worker
      }
      const result = await workerFunction(...args)
      data = { type: 'success', result }
    } catch (error: any) {
      const { message, name } = error
      data = {
        type: 'error',
        error: {
          message,
          name
        }
      }
    }
    self.postMessage(data)
  }
}

/**
 * Creates a control function to send signal to main thread.
 *
 * @param name - The function name
 * @returns A control function
 */
function control (name: string) {
  return (...args: any[]) => {
    const data: MessageData = {
      type: 'control', name, args
    }
    self.postMessage(data)
  }
}

export { expose, control }
