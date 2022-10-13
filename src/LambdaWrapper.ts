type Functions = { [key: string]: (...args: any[]) => any }

function expose (functions: Functions, readyPromise?: Promise<null>) {
  self.onmessage = async (msg: MessageEvent<{
    name: string
    args: any[]
  }>) => {
    await readyPromise
    const { name, args } = msg.data
    try {
      const result = functions[name](...args)
      self.postMessage({ ok: true, result })
    } catch (error: any) {
      const { message, name } = error
      self.postMessage({ ok: false, error: { message, name }})
    }
  }
}

export { expose }
