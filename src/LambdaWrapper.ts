type Functions = { [key: string]: (...args: any[]) => any }

function expose (functions: Functions, readyPromise?: Promise<null>) {
  self.onmessage = async (msg: MessageEvent<{
    name: string
    args: any[]
  }>) => {
    await readyPromise
    const { name, args } = msg.data
    let data: MessageData
    try {
      const result = functions[name](...args)
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

function control (name: string) {
  return (...args: any[]) => {
    const data: MessageData = {
      type: 'control', name, args
    }
    self.postMessage(data)
  }
}

export { expose, control }
