type Task = {
  name: string
  args: any[]
  resolve: (value: any) => void
  reject: (reason: any) => void
}

class LambdaWorker {
  worker: Worker
  #scriptURL: string
  #queue: Task[] = []
  #running: Task | null = null
  #commandHandlers: { [key: string]: ((...args: any[]) => void) | undefined } = {}

  constructor (scriptURL: string) {
    this.#scriptURL = scriptURL
    this.worker = new Worker(scriptURL)
    this.#setUp()
  }

  #setUp () {
    this.worker.onmessage = (msg: MessageEvent<MessageData>) => {
      const { type } = msg.data
      if (type === 'control') {
        const { name, args } = msg.data
        const handler = this.#commandHandlers[name]
        if (handler) {
          handler(...args)
        } else {
          console.warn(`Unknown command ${name}`)
        }
      } else {
        const { resolve, reject } = this.#running!
        this.#running = null
        this.#next()
        if (type === 'success') {
          resolve(msg.data.result)
        } else {
          const { name, message } = msg.data.error
          const error = new Error(message)
          error.name = name
          reject(error)
        }
      }
    }
  }

  #run (task: Task) {
    const { name, args } = task
    this.#running = task
    this.worker.postMessage({ name, args })
  }

  #next () {
    if (this.#queue.length) {
      const task = this.#queue.shift()!
      this.#run(task)
    }
  }

  #schedule (task: Task) {
    if (this.#running) {
      this.#queue.push(task)
    } else {
      this.#run(task)
    }
  }

  register (name: string) {
    return (...args: any[]) =>
      new Promise<any>((resolve, reject) =>
        this.#schedule({ name, args, resolve, reject }))
  }

  skip () {
    if (!this.#running) {
      return false
    }
    this.worker.terminate()
    this.#running = null
    this.worker = new Worker(this.#scriptURL)
    this.#setUp()
    this.#next()
    return true
  }

  skipAll () {
    if (!this.#running) {
      return false
    }
    this.worker.terminate()
    this.#running = null
    this.#queue = []
    this.worker = new Worker(this.#scriptURL)
    this.#setUp()
    return true
  }

  control (command: string, callback: (...args: any[]) => void) {
    this.#commandHandlers[command] = callback
  }
}

export { LambdaWorker }
