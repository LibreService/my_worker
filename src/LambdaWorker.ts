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

  constructor (scriptURL: string) {
    this.#scriptURL = scriptURL
    this.worker = new Worker(scriptURL)
    this.#setUp()
  }

  #setUp () {
    this.worker.onmessage = msg => {
      const { resolve, reject } = this.#running!
      this.#running = null
      this.#next()
      const { ok, result, error } = msg.data
      if (ok) {
        resolve(result)
      } else {
        const e = new Error(error.message)
        e.name = error.name
        reject(e)
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
        this.#schedule({ name, args, resolve, reject}))
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
}

export { LambdaWorker }
